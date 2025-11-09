// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * Mock CertificateNFT contract for testing
 * This is a simple implementation for testing purposes
 * Replace with your actual CertificateNFT contract in production
 */
contract MockCertificateNFT {
    mapping(address => mapping(uint256 => bool)) public certificates;
    mapping(uint256 => address) public certificateOwners;
    uint256 public totalCertificates;

    event CertificateMinted(address indexed to, uint256 indexed courseId, uint256 certificateId);

    function mint(address to, uint256 courseId) external {
        uint256 certificateId = totalCertificates + 1;
        certificates[to][courseId] = true;
        certificateOwners[certificateId] = to;
        totalCertificates++;
        
        emit CertificateMinted(to, courseId, certificateId);
    }

    function hasCertificate(address owner, uint256 courseId) external view returns (bool) {
        return certificates[owner][courseId];
    }
}

