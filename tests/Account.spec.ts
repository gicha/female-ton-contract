import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import '@ton/test-utils';
import { toNano } from '@ton/ton';
import { HealthDataRecord } from '../build/Account/tact_HealthDataRecord';
import { Account } from '../wrappers/Account';

describe('Account', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let account: SandboxContract<Account>;
    let mockAccountOwner: SandboxContract<TreasuryContract>;


    beforeEach(async () => {
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury('deployer');
        mockAccountOwner = await blockchain.treasury('mockAccountOwner');
        account = blockchain.openContract(await Account.fromInit(mockAccountOwner.address));
    });
    it('should set public key', async () => {
        const deployerAddress = deployer.getSender();
        const publicKey = '0x' + 'A'.repeat(64);
        await account.send(
            deployerAddress,
            { value: toNano('0.005') },
            { $$type: 'SetPublicKey', publicKey: publicKey },
        );
        const publicKeyResult = await account.getPublicKey();
        expect(publicKeyResult).toEqual(publicKey);
        await account.send(
            deployerAddress,
            { value: toNano('0.005') },
            { $$type: 'SetPublicKey', publicKey: publicKey },
        );
    });
    it('should add health data', async () => {
        const deployerAddress = deployer.getSender();
        const encryptedData = 'test data';
        const deployResult = await account.send(
            deployerAddress,
            { value: toNano('0.02') },
            {
                $$type: 'AddHealthData',
                accessedAddress: mockAccountOwner.address,
                encryptedData: encryptedData,
            },
        );
        const recordsCountAfter = await account.getNumHealthDataRecords();
        expect(recordsCountAfter).toEqual(1n);
        const recordAddress = await account.getHealthDataAddress(1n, mockAccountOwner.address);

        expect(deployResult.transactions).toHaveTransaction({
            from: account.address,
            to: recordAddress,
            success: true,
        });

        const record = blockchain.openContract(HealthDataRecord.fromAddress(recordAddress));
        const accessedAddress = await record.getAccessedAddress();
        const recordData = await record.getEncryptedData();
        expect(accessedAddress.toString()).toEqual(mockAccountOwner.address.toString());
        expect(recordData).toEqual(encryptedData);
    });
});
