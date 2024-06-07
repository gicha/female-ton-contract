# Health Data Record Smart Contract

This repository contains the source code for a Health Data Record smart contract written in TON.

## Overview

The Health Data Record smart contract is designed to securely store and manage health data records. It is part of a larger system that includes an Account contract. The Account contract is the parent contract and the Health Data Record contract is the child contract.

## Contract Structure

The Health Data Record contract has the following state variables:

- `parent`: The address of the parent contract (Account contract).
- `seqno`: The index of the health data record.
- `accessedAddress`: The address that has access to the encrypted data.
- `encryptedData`: The health data encrypted by the public key of the accessedAddress.

The contract is initialized with the parent contract's address, the sequence number of the health data record, and the address that will have access to the encrypted data.

## Contract Functions

The contract has the following functions:

- `receive(msg: AddInternalHealthData)`: This function is called when a new health data record is added. It requires that the sender is the parent contract and that the encrypted data has not been set yet. It then sets the encrypted data with the data from the message.

- `accessedAddress()`: This getter function returns the address that has access to the encrypted data.

- `encryptedData()`: This getter function returns the encrypted health data.

- `balance()`: This getter function returns the balance of the contract.

## Security

The contract ensures that only the parent contract can add new health data records. It also ensures that the health data is encrypted and can only be accessed by the specified address.

## Usage

To use this contract, you first need to deploy the Account contract. Then, you can add health data records by calling the `AddHealthData` function of the Account contract. The Account contract will then deploy a new Health Data Record contract for each health data record.

## Conclusion

This Health Data Record contract provides a secure and efficient way to manage health data records on the TON blockchain.
