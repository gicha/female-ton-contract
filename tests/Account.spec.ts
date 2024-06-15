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
        account = blockchain.openContract(await Account.fromInit(mockAccountOwner.address.toString()));

        const deployResult = await account.send(
            deployer.getSender(),
            { value: toNano('0.05') },
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
        const encryptedPeriodDateStart = 'dateStart';
        const encryptedPeriodDateEnd = 'dateEnd';
        const deployResult = await account.send(
            deployerAddress,
            { value: toNano('0.02') },
            {
                $$type: 'AddHealthData',
                accessedAddress: mockAccountOwner.address,
                encryptedPeriodDateStart: encryptedPeriodDateStart,
                encryptedPeriodDateEnd: encryptedPeriodDateEnd,
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
        const recordState = await record.getHealthDataState();
        expect(accessedAddress.toString()).toEqual(mockAccountOwner.address.toString());
        expect(recordState.encryptedPeriodDateStart).toEqual(encryptedPeriodDateStart);
        expect(recordState.encryptedPeriodDateEnd).toEqual(encryptedPeriodDateEnd);
        expect(recordState.recordIsActive).toEqual(true);
        const inactiveResult = await account.send(
            deployerAddress,
            { value: toNano('0.02') },
            {
                $$type: 'SetInactiveRecord',
                accessedAddress: mockAccountOwner.address,
                seqno: 1n,
            },
        );
        expect(inactiveResult.transactions).toHaveTransaction({
            from: account.address,
            to: recordAddress,
            success: true,
        });
        const inactiveRecordState = await record.getHealthDataState();
        expect(inactiveRecordState.recordIsActive).toEqual(false);
    });
    it('should change health data', async () => {
        const deployerAddress = deployer.getSender();
        const encryptedPeriodDateStart = 'dateStart';
        const encryptedPeriodDateEnd = 'dateEnd';
        await account.send(
            deployerAddress,
            { value: toNano('0.02') },
            {
                $$type: 'AddHealthData',
                accessedAddress: mockAccountOwner.address,
                encryptedPeriodDateStart: encryptedPeriodDateStart,
                encryptedPeriodDateEnd: encryptedPeriodDateEnd,
            },
        );
        const recordAddress = await account.getHealthDataAddress(1n, mockAccountOwner.address);
        const record = blockchain.openContract(HealthDataRecord.fromAddress(recordAddress));
        const newEncryptedPeriodDateStart = 'changedDateStart';
        const newEncryptedPeriodDateEnd = 'changedDateEnd';
        const updatedResult = await account.send(
            deployerAddress,
            { value: toNano('0.02') },
            {
                $$type: 'ChangeHealthData',
                accessedAddress: mockAccountOwner.address,
                seqno: 1n,
                encryptedPeriodDateStart: newEncryptedPeriodDateStart,
                encryptedPeriodDateEnd: newEncryptedPeriodDateEnd,
            },
        );
        expect(updatedResult.transactions).toHaveTransaction({
            from: account.address,
            to: recordAddress,
            success: true,
        });
        const inactiveRecordState = await record.getHealthDataState();
        expect(inactiveRecordState.encryptedPeriodDateStart).toEqual(newEncryptedPeriodDateStart);
        expect(inactiveRecordState.encryptedPeriodDateEnd).toEqual(newEncryptedPeriodDateEnd);
    });
    it('should inactivate health data', async () => {
        const deployerAddress = deployer.getSender();
        const encryptedPeriodDateStart = 'dateStart';
        const encryptedPeriodDateEnd = 'dateEnd';
        await account.send(
            deployerAddress,
            { value: toNano('0.02') },
            {
                $$type: 'AddHealthData',
                accessedAddress: mockAccountOwner.address,
                encryptedPeriodDateStart: encryptedPeriodDateStart,
                encryptedPeriodDateEnd: encryptedPeriodDateEnd,
            },
        );
        const recordAddress = await account.getHealthDataAddress(1n, mockAccountOwner.address);
        const record = blockchain.openContract(HealthDataRecord.fromAddress(recordAddress));
        const inactiveResult = await account.send(
            deployerAddress,
            { value: toNano('0.02') },
            {
                $$type: 'SetInactiveRecord',
                accessedAddress: mockAccountOwner.address,
                seqno: 1n,
            },
        );
        expect(inactiveResult.transactions).toHaveTransaction({
            from: account.address,
            to: recordAddress,
            success: true,
        });
        const inactiveRecordState = await record.getHealthDataState();
        expect(inactiveRecordState.recordIsActive).toEqual(false);
    });
});
