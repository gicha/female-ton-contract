import { toNano } from '@ton/core';
import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import '@ton/test-utils';
import { HealthDataRecord } from '../build/Account/tact_HealthDataRecord';
import { Account } from '../wrappers/Account';

describe('Account', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let account: SandboxContract<Account>;


    beforeEach(async () => {
        blockchain = await Blockchain.create();
        account = blockchain.openContract(await Account.fromInit());
        deployer = await blockchain.treasury('deployer');
        const deployResult = await account.send(
            deployer.getSender(),
            { value: toNano('0.004') },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: account.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        const deployer = await blockchain.treasury('deployer');
        const deployerAddress = deployer.getSender();
        const recordsCount = await account.getNumHealthDataRecords();
        expect(recordsCount).toEqual(0n);
    });
    it('should set public key', async () => {
        const deployer = await blockchain.treasury('deployer');
        const deployerAddress = deployer.getSender();
        const publicKey = '0x' + 'A'.repeat(64);
        // const privateKey = '0xQQ';
        await account.send(
            deployerAddress,
            { value: toNano('0.004') },
            { $$type: 'SetPublicKey', publicKey: publicKey },
        );
        const publicKeyResult = await account.getPublicKey();
        expect(publicKeyResult).toEqual(publicKey);
    });
    it('should add health data', async () => {
        const deployer = await blockchain.treasury('deployer');
        const deployerAddress = deployer.getSender();
        const encryptedData = 'test data';
        const deployResult = await account.send(
            deployerAddress,
            { value: toNano('0.0153') },
            {
                $$type: 'AddHealthData',
                accessedAddress: deployerAddress.address,
                encryptedData: encryptedData,
            },
        );
        const recordsCountAfter = await account.getNumHealthDataRecords();
        expect(recordsCountAfter).toEqual(1n);
        const recordAddress = await account.getHealthDataAddress(1n, deployerAddress.address);

        expect(deployResult.transactions).toHaveTransaction({
            from: account.address,
            to: recordAddress,
            success: true,
        });

        const record = blockchain.openContract(HealthDataRecord.fromAddress(recordAddress));
        const accessedAddress = await record.getAccessedAddress();
        const recordData = await record.getEncryptedData();
        expect(accessedAddress.toString()).toEqual(deployerAddress.address.toString());
        expect(recordData).toEqual(encryptedData);
    });
});
