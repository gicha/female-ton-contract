import { Address, Sender, TonClient, toNano } from '@ton/ton';
import { Account } from '../wrappers/Account';

const client = new TonClient({
    endpoint: 'https://toncenter.com/api/v2/jsonRPC',
    timeout: 60000,
});


export async function deploy(sender: Sender, accountOwnerAddress: Address) {
    const contract = await Account.fromInit(accountOwnerAddress);
    const openedContract = client.open(contract);
    await openedContract.send(
        sender,
        { value: toNano('0.005') },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );
}

export async function setPublicKey(sender: Sender, accountOwnerAddress: Address, publicKey: string) {
    const contract = await Account.fromInit(accountOwnerAddress);
    const openedContract = client.open(contract);
    await openedContract.send(sender, { value: toNano('0.005') }, { $$type: 'SetPublicKey', publicKey: publicKey });
    console.log(client.isContractDeployed(openedContract.address));
    // const publicKeyResult = await openedContract.getPublicKey();
    // expect(publicKeyResult).toEqual(publicKey);
}

// export async function sendData(provider: NetworkProvider, accountOwnerAddress: Address, encryptedData: string) {
//     const account = provider.open(await Account.fromInit(accountOwnerAddress));
//     await account.send(
//         provider.sender(),
//         { value: toNano('0.02') },
//         {
//             $$type: 'AddHealthData',
//             accessedAddress: accountOwnerAddress,
//             encryptedData: encryptedData,
//         },
//     );
// }

// export async function getRecordsCount(provider: NetworkProvider, accountOwnerAddress: Address): Promise<bigint> {
//     const account = provider.open(await Account.fromInit(accountOwnerAddress));
//     return await account.getNumHealthDataRecords();
// }

// export async function getEncryptedData(provider: NetworkProvider, accountOwnerAddress: Address, seqno: bigint): Promise<string> {
//     const account = provider.open(await Account.fromInit(accountOwnerAddress));
//     const recordAddress = await account.getHealthDataAddress(seqno, accountOwnerAddress);
//     const record = provider.open(await HealthDataRecord.fromAddress(recordAddress));
//     return await record.getEncryptedData();
// }



