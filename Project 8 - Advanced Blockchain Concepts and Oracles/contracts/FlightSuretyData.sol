pragma solidity ^ 0.5 .8;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath
    for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address private contractOwner; // Account used to deploy contract
    bool private operational = true; // Blocks all state changes throughout the contract if false
    mapping(address => bool) private authorizedCallers; // Addresses that can access this contract

    // data structure to determine an airline
    struct Airline {
        address airlineAccount; // account address of airline
        string name; // name of airline
        bool isRegistered; // is this airline registered or not
        bool isFunded; // is this airline funded or not
        uint256 fund; // amount of fund available
    }
    // mapping to store airlines data
    mapping(address => Airline) private airlines;
    // number of airlines available
    uint256 internal airlinesCount = 0;

    // data structure to determine insurance
    struct Insurance {
        address payable insureeAccount; // account address of insuree
        uint256 amount; // insurance amount
        address airlineAccount; // account address of airline
        string airlineName; // name of airline
        uint256 timestamp; // timestamp of airline
    }
    // mapping to store insurances data
    mapping(bytes32 => Insurance[]) private insurances;
    // mapping to indicate flights whose payout have been credited
    mapping(bytes32 => bool) private payoutCredited;
    // mapping to store credits available for each insuree
    mapping(address => uint256) private creditPayoutsToInsuree;

    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/

    // event to trigger when airline gets registered
    event AirlineRegistered(
        address indexed airlineAccount, // account address of airline
        string airlineName // name of airline
    );
    // event to trigger when airline gets funded
    event AirlineFunded(
        address indexed airlineAccount, // account address of airline
        uint256 amount // amount funded to airline
    );
    // event to trigger when insurance is purchased
    event InsurancePurchased(
        address indexed insureeAccount, // account address of insuree
        uint256 amount, // insurance amount
        address airlineAccount, // account address of airline
        string airlineName, // name of airline
        uint256 timestamp // timestamp of airline
    );
    // event to trigger when insurance credit is available
    event InsuranceCreditAvailable(
        address indexed airlineAccount, // account address of airline
        string indexed airlineName, // name of airline
        uint256 indexed timestamp // timestamp of airline
    );
    // event to trigger when insurance is credited
    event InsuranceCredited(
        address indexed insureeAccount, // account address of insuree
        uint256 amount // insurance amount
    );
    // event to trigger when insurance is paid
    event InsurancePaid(
        address indexed insureeAccount, // account address of insuree
        uint256 amount // insurance amount
    );

    /**
     * @dev Constructor
     *      The deploying account becomes contractOwner
     */
    constructor(
        address _initialAirlineAccount,
        string memory _initialAirlineName
    )
    public {
        contractOwner = msg.sender;
        addAirline(_initialAirlineAccount, _initialAirlineName);
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
     * @dev Modifier that requires the "operational" boolean variable to be "true"
     *      This is used on all state changing functions to pause the contract in 
     *      the event there is an issue that needs to be fixed
     */
    modifier requireIsOperational() {
        require(operational, "Contract is currently not operational");
        _; // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
     * @dev Modifier that requires the caller address either be registered as "authorized" or be the owner of the contract.
     *      This is used to avoid that other accounts may alter this data contract.
     */
    modifier requireIsCallerAuthorized() {
        require(authorizedCallers[msg.sender] == true || msg.sender == contractOwner, "Caller is not authorized");
        _;
    }

    /**
     * @dev Modifier that requires the "ContractOwner" account to be the function caller
     */
    modifier requireContractOwner() {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    /**
     * @dev Modifier that requires an airline account to be the function caller
     */
    modifier requireIsAirline() {
        require(airlines[msg.sender].isRegistered == true, "Caller is not airline");
        _;
    }

    /**
     * @dev Modifier that requires an airline account to be funded
     */
    modifier requireIsAirlineFunded(address _airlineAccount) {
        require(airlines[_airlineAccount].isFunded == true, "Airline is not funded");
        _;
    }

    /**
     * @dev Modifier that requires message data to be filled
     */
    modifier requireMsgData() {
        require(msg.data.length > 0, "Message data is empty");
        _;
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
     * @dev Add a new address to the list of authorized callers
     *      Can only be called by the contract owner
     */
    function authorizeCaller(address contractAddress) external requireContractOwner {
        authorizedCallers[contractAddress] = true;
    }

    /**
     * @dev Get operating status of contract
     *
     * @return A bool that is the current operating status
     */
    function isOperational()
    external
    view
    returns(bool) {
        return operational;
    }

    /**
     * @dev Sets contract operations on/off
     *
     * When operational mode is disabled, all write transactions except for this one will fail
     */
    function setOperatingStatus(
        bool mode
    )
    external
    requireContractOwner {
        operational = mode;
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

    /**
     * @dev Add an airline to the registration queue
     *      Can only be called from FlightSuretyApp contract
     *
     */
    function registerAirline(
        address _airlineAccount,
        string calldata _airlineName
    )
    external
    requireIsCallerAuthorized {
        addAirline(_airlineAccount, _airlineName);
    }

    function addAirline(
        address _airlineAccount,
        string memory _airlineName
    )
    private {
        airlinesCount = airlinesCount.add(1);
        airlines[_airlineAccount] = Airline(
            _airlineAccount,
            _airlineName,
            true,
            false,
            0
        );
        emit AirlineRegistered(_airlineAccount, _airlineName);
    }

    /**
     * @dev Buy insurance for a flight
     *
     */
    function buy(
        address payable _insureeAccount,
        address _airlineAccount,
        string calldata _airlineName,
        uint256 _timestamp
    )
    external
    payable {
        bytes32 flightKey = getFlightKey(_airlineAccount, _airlineName, _timestamp);
        airlines[_airlineAccount].fund = airlines[_airlineAccount].fund.add(msg.value);
        insurances[flightKey].push(
            Insurance(
                _insureeAccount,
                msg.value,
                _airlineAccount,
                _airlineName,
                _timestamp
            )
        );
        emit InsurancePurchased(
            _insureeAccount,
            msg.value,
            _airlineAccount,
            _airlineName,
            _timestamp
        );
    }

    /**
     *  @dev Credits payouts to insurees
     */
    function creditInsurees(
        uint256 _creditPercentage,
        address _airlineAccount,
        string calldata _airlineName,
        uint256 _timestamp
    ) external
    requireIsCallerAuthorized {
        bytes32 flightKey = getFlightKey(_airlineAccount, _airlineName, _timestamp);
        require(!payoutCredited[flightKey], "Insurance payout have already been credited");
        for (uint i = 0; i < insurances[flightKey].length; i++) {
            address insureeAccount = insurances[flightKey][i].insureeAccount;
            uint256 amountToReceive = insurances[flightKey][i].amount.mul(_creditPercentage).div(100);
            creditPayoutsToInsuree[insureeAccount] = creditPayoutsToInsuree[insureeAccount].add(amountToReceive);
            airlines[_airlineAccount].fund = airlines[_airlineAccount].fund.sub(amountToReceive);
            emit InsuranceCredited(insureeAccount, amountToReceive);
        }
        payoutCredited[flightKey] = true;
        emit InsuranceCreditAvailable(_airlineAccount, _airlineName, _timestamp);
    }

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
     */
    function pay(
        address payable _insureeAccount
    )
    external
    requireIsCallerAuthorized {
        uint256 payableAmount = creditPayoutsToInsuree[_insureeAccount];
        delete(creditPayoutsToInsuree[_insureeAccount]);
        _insureeAccount.transfer(payableAmount);
        emit InsurancePaid(_insureeAccount, payableAmount);
    }

    /**
     * @dev Initial funding for the insurance. Unless there are too many delayed flights
     *      resulting in insurance payouts, the contract should be self-sustaining
     *
     */
    function fund(
        address _airlineAccount
    )
    external
    payable
    requireIsCallerAuthorized {
        addFund(_airlineAccount, msg.value);
        airlines[_airlineAccount].isFunded = true;
        emit AirlineFunded(_airlineAccount, msg.value);
    }

    function addFund(
        address _airlineAccount,
        uint256 _fundValue
    )
    private {
        airlines[_airlineAccount].fund = airlines[_airlineAccount].fund.add(_fundValue);
    }

    function getFlightKey(
        address airline,
        string memory flight,
        uint256 timestamp
    )
    pure
    internal
    returns(bytes32) {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    /**
     *  @dev check if address is of airline or not
     *
     */
    function isAirline(
        address _airlineAccount
    )
    external
    view
    returns(bool) {
        return airlines[_airlineAccount].isRegistered == true;
    }

    /**
     *  @dev check if address is of airline or not
     *
     */
    function isAirlineFunded(
        address _airlineAccount
    )
    external
    view
    requireIsCallerAuthorized
    returns(bool) {
        return airlines[_airlineAccount].isFunded == true;
    }

    /**
     * @dev get fund of airline
     */
    function getFund(
        address _airlineAccount
    ) external
    view
    requireIsCallerAuthorized
    returns(uint256) {
        return airlines[_airlineAccount].fund;
    }

    /**
     *  @dev check if address is of airline or not
     *
     */
    function getAirlinesCount()
    external
    view
    returns(uint256) {
        return airlinesCount;
    }

    /**
     *  @dev get amount paid by insuree
     *
     */
    function getAmountPaidByInsuree(
        address payable _insureeAccount,
        address _airlineAccount,
        string calldata _airlineName,
        uint256 _timestamp
    ) external
    view
    returns(uint256 amountPaid) {
        amountPaid = 0;
        bytes32 flightKey = getFlightKey(_airlineAccount, _airlineName, _timestamp);
        for (uint i = 0; i < insurances[flightKey].length; i++) {
            if (insurances[flightKey][i].insureeAccount == _insureeAccount) {
                amountPaid = insurances[flightKey][i].amount;
                break;
            }
        }
    }

    /**
     *  @dev Returns insurees credits
     *
     */
    function getInsureePayoutCredits(
        address payable _insureeAccount
    ) external
    view
    returns(uint256 amount) {
        return creditPayoutsToInsuree[_insureeAccount];
    }

    /**
     * @dev Fallback function for funding smart contract.
     *
     */
    function ()
    external
    payable
    requireMsgData
    requireIsAirline {
        addFund(msg.sender, msg.value);
        airlines[msg.sender].isFunded = true;
        emit AirlineFunded(msg.sender, msg.value);
    }

}