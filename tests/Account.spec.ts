import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { Account } from '../wrappers/Account';
import '@ton/test-utils';

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
            {
                value: toNano('0.05'),
            },
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
        // the check is done inside beforeEach
        // blockchain and account are ready to use
    });
});
