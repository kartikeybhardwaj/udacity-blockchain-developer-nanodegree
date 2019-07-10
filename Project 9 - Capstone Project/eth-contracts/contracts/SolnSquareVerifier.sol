pragma solidity >= 0.4 .21 < 0.6 .0;

import './ERC721Mintable.sol';

// a contract call to the zokrates generated solidity contract <Verifier> or <renamedVerifier>
interface Verifier {
    function verifyTx(
        uint[2] calldata a,
        uint[2] calldata a_p,
        uint[2][2] calldata b,
        uint[2] calldata b_p,
        uint[2] calldata c,
        uint[2] calldata c_p,
        uint[2] calldata h,
        uint[2] calldata k,
        uint[2] calldata input
    ) external returns(bool r);
}

// another contract named SolnSquareVerifier that inherits from your ERC721Mintable class
contract SolnSquareVerifier is HouseERC721Token {

    Verifier verifier;

    // a solutions struct that can hold an index & an address
    struct Solution {
        uint256 index;
        address accountSolution;
    }

    // an array of the above struct
    Solution[] private _solutions;

    // a mapping to store unique solutions submitted
    mapping(bytes32 => Solution) private _uniqueSolutions;

    // TODO Create an event to emit when a solution is added
    event SolutionAdded(address account);

    constructor(address verifierAddress)
    public {
        verifier = Verifier(verifierAddress);
    }

    // a function to add the solutions to the array and emit the event
    function addSolution(bytes32 solutionId, uint256 tokenId, address accountSolution)
    public {
        _solutions.push(Solution({
            index: tokenId,
            accountSolution: accountSolution
        }));
        _uniqueSolutions[solutionId] = Solution({
            index: tokenId,
            accountSolution: accountSolution
        });
        emit SolutionAdded(accountSolution);
    }

    // a function to mint new NFT only after the solution has been verified
    //  - make sure the solution is unique (has not been used before)
    //  - make sure to handle metadata as well as tokenSupply
    function mintNFT(
        address to,
        uint256 tokenId,
        uint[2] memory a,
        uint[2] memory a_p,
        uint[2][2] memory b,
        uint[2] memory b_p,
        uint[2] memory c,
        uint[2] memory c_p,
        uint[2] memory h,
        uint[2] memory k,
        uint[2] memory input
    )
    public {
        bytes32 solutionId = getSolutionId(a, a_p, b, b_p, c, c_p, h, k, input);
        require(_uniqueSolutions[solutionId].accountSolution == address(0), "Solution already exists");
        require(verifier.verifyTx(a, a_p, b, b_p, c, c_p, h, k, input), "Solution is not verified");
        addSolution(solutionId, tokenId, to);
        mint(to, tokenId);
    }

    function getSolutionId(
        uint[2] memory a,
        uint[2] memory a_p,
        uint[2][2] memory b,
        uint[2] memory b_p,
        uint[2] memory c,
        uint[2] memory c_p,
        uint[2] memory h,
        uint[2] memory k,
        uint[2] memory input
    )
    private
    pure
    returns(bytes32) {
        return keccak256(abi.encodePacked(a, a_p, b, b_p, c, c_p, h, k, input));
    }

}