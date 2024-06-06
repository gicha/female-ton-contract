import { NetworkProvider } from '@ton/blueprint';
import { toNano } from '@ton/core';
import { Account } from '../wrappers/Account';

export async function run(provider: NetworkProvider) {

    const account = provider.open(await Account.fromInit(provider.sender().address!.toString()));

    await account.send(
        provider.sender(),
        {
            value: toNano('0.004'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(account.address);

}
