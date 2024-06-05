import { toNano } from '@ton/core';
import { Account } from '../wrappers/Account';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const account = provider.open(await Account.fromInit());

    await account.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(account.address);

    // run methods on `account`
}
