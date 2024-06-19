import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import '@ton/test-utils';
import { Dictionary, toNano } from '@ton/ton';
import { MonthPeriodData } from '../build/Account/tact_MonthPeriodData';
import { Account, PeriodDataItem } from '../wrappers/Account';

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
    it('should add 2 period data items', async () => {
        const deployerAddress = deployer.getSender();
        /// Set data
        const monthIndex = BigInt(1);
        const toAdd = Dictionary.empty<bigint, PeriodDataItem>();
        toAdd.set(
            1n,
            {
                $$type: 'PeriodDataItem',
                date: '2021-01-01',
            }
        );
        toAdd.set(
            2n,
            {
                $$type: 'PeriodDataItem',
                date: '2021-01-02',
            }
        );
        const toDelete = Dictionary.empty<bigint, PeriodDataItem>();
        const expectedMap = toAdd;
        /// Run logic
        const deployResult = await account.send(
            deployerAddress,
            { value: toNano('0.5') },
            {
                $$type: 'UpdateMonthPeriodData',
                accessedAddress: mockAccountOwner.address,
                monthIndex: monthIndex,
                toAdd: toAdd,
                toDelete: toDelete,
            },
        );
        const filledMonthsCount = await account.getNumFilledMonths();
        expect(filledMonthsCount).toEqual(1n);
        const monthPeriodAddress = await account.getMonthPeriodDataAddress(1n, mockAccountOwner.address);
        expect(deployResult.transactions).toHaveTransaction({
            from: account.address,
            to: monthPeriodAddress,
            success: true,
        });
        const monthPeriod = blockchain.openContract(MonthPeriodData.fromAddress(monthPeriodAddress));
        const accessedAddress = await monthPeriod.getAccessedAddress();
        const monthPeriodDataCount = await monthPeriod.getDataLength();
        const data = await monthPeriod.getData();
        expect(accessedAddress.toString()).toEqual(mockAccountOwner.address.toString());
        expect(monthPeriodDataCount).toEqual(BigInt(expectedMap.size));
        for (let i = 0; i < expectedMap.size; i++) {
            const expectedItem = expectedMap.get(BigInt(i));
            const item = data.get(BigInt(i));
            expect(item?.date).toEqual(expectedItem?.date);
        }
    });
    it('should add 2 -> add 2 and remove 1 period data items', async () => {
        const deployerAddress = deployer.getSender();
        /// Set data
        const monthIndex = BigInt(1);
        const toAddStep1 = Dictionary.empty<bigint, PeriodDataItem>();
        toAddStep1.set(
            1n,
            {
                $$type: 'PeriodDataItem',
                date: '2021-01-01',
            }
        );
        toAddStep1.set(
            2n,
            {
                $$type: 'PeriodDataItem',
                date: '2021-01-02',
            }
        );
        const toDeleteStep1 = Dictionary.empty<bigint, PeriodDataItem>();
        const toDeleteStep2 = Dictionary.empty<bigint, PeriodDataItem>();
        toDeleteStep2.set(
            1n,
            {
                $$type: 'PeriodDataItem',
                date: '2021-01-01',
            }
        );
        const toAddStep2 = Dictionary.empty<bigint, PeriodDataItem>();
        toAddStep2.set(
            1n,
            {
                $$type: 'PeriodDataItem',
                date: '2021-01-03',
            }
        );
        toAddStep2.set(
            2n,
            {
                $$type: 'PeriodDataItem',
                date: '2021-01-04',
            }
        );
        const expectedMap = Dictionary.empty<bigint, PeriodDataItem>();
        expectedMap.set(1n, toAddStep1.get(2n)!);
        expectedMap.set(2n, toAddStep2.get(1n)!);
        expectedMap.set(3n, toAddStep2.get(2n)!);

        /// Run logic
        await account.send(
            deployerAddress,
            { value: toNano('0.5') },
            {
                $$type: 'UpdateMonthPeriodData',
                accessedAddress: mockAccountOwner.address,
                monthIndex: monthIndex,
                toAdd: toAddStep1,
                toDelete: toDeleteStep1,
            },
        );
        await account.send(
            deployerAddress,
            { value: toNano('0.5') },
            {
                $$type: 'UpdateMonthPeriodData',
                accessedAddress: mockAccountOwner.address,
                monthIndex: monthIndex,
                toAdd: toAddStep2,
                toDelete: toDeleteStep2,
            },
        );
        const filledMonthsCount = await account.getNumFilledMonths();
        expect(filledMonthsCount).toEqual(1n);
        const monthPeriodAddress = await account.getMonthPeriodDataAddress(1n, mockAccountOwner.address);
        const monthPeriod = blockchain.openContract(MonthPeriodData.fromAddress(monthPeriodAddress));
        const monthPeriodDataCount = await monthPeriod.getDataLength();
        const data = await monthPeriod.getData();
        expect(monthPeriodDataCount).toEqual(BigInt(expectedMap.size));
        for (let i = 0; i < expectedMap.size; i++) {
            const expectedItem = expectedMap.get(BigInt(i));
            const item = data.get(BigInt(i));
            expect(item?.date).toEqual(expectedItem?.date);
        }
    });
    it('should add period data items with different months to different contracts', async () => {
        const deployerAddress = deployer.getSender();
        /// Set data
        const monthIndex1 = 1n;
        const monthIndex2 = 2n;
        const toAdd1 = Dictionary.empty<bigint, PeriodDataItem>();
        toAdd1.set(
            1n,
            {
                $$type: 'PeriodDataItem',
                date: '2021-01-01',
            }
        );
        const toDelete1 = Dictionary.empty<bigint, PeriodDataItem>();

        const toAdd2 = Dictionary.empty<bigint, PeriodDataItem>();
        toAdd2.set(
            1n,
            {
                $$type: 'PeriodDataItem',
                date: '2021-02-01',
            }
        );
        const toDelete2 = Dictionary.empty<bigint, PeriodDataItem>();
        const expectedMap1 = Dictionary.empty<bigint, PeriodDataItem>();
        const expectedMap2 = Dictionary.empty<bigint, PeriodDataItem>();
        expectedMap1.set(1n, toAdd1.get(1n)!);
        expectedMap2.set(1n, toAdd2.get(1n)!);

        /// Run logic
        await account.send(
            deployerAddress,
            { value: toNano('0.5') },
            {
                $$type: 'UpdateMonthPeriodData',
                accessedAddress: mockAccountOwner.address,
                monthIndex: monthIndex1,
                toAdd: toAdd1,
                toDelete: toDelete1,
            },
        );
        await account.send(
            deployerAddress,
            { value: toNano('0.5') },
            {
                $$type: 'UpdateMonthPeriodData',
                accessedAddress: mockAccountOwner.address,
                monthIndex: monthIndex2,
                toAdd: toAdd2,
                toDelete: toDelete2,
            },
        );
        const filledMonthsCount = await account.getNumFilledMonths();
        expect(filledMonthsCount).toEqual(2n);
        const monthPeriodAddress1 = await account.getMonthPeriodDataAddress(1n, mockAccountOwner.address);
        const monthPeriod1 = blockchain.openContract(MonthPeriodData.fromAddress(monthPeriodAddress1));
        const monthPeriodDataCount1 = await monthPeriod1.getDataLength();
        const data1 = await monthPeriod1.getData();
        expect(monthPeriodDataCount1).toEqual(BigInt(expectedMap1.size));
        expect(data1.get(BigInt(1))?.date).toEqual(expectedMap1.get(BigInt(1))?.date);

        const monthPeriodAddress2 = await account.getMonthPeriodDataAddress(2n, mockAccountOwner.address);
        const monthPeriod2 = blockchain.openContract(MonthPeriodData.fromAddress(monthPeriodAddress2));
        const monthPeriodDataCount2 = await monthPeriod2.getDataLength();
        const data2 = await monthPeriod2.getData();
        expect(monthPeriodDataCount2).toEqual(BigInt(expectedMap2.size));
        expect(data2.get(BigInt(1))?.date).toEqual(expectedMap2.get(BigInt(1))?.date);

    });

});
