import { NetworkProvider } from '@ton/blueprint';
import { Address, toNano } from '@ton/ton';
import { HealthDataRecord } from '../build/Account/tact_HealthDataRecord';
import { Account } from '../wrappers/Account';

// const client = new TonClient({
//     endpoint: 'https://toncenter.com/api/v2/jsonRPC',
// });
// const workchain = 0;

export async function setPublicKey(provider: NetworkProvider, accountOwnerAddress: Address, publicKey: string) {
    const account = provider.open(await Account.fromInit(accountOwnerAddress));
    await account.send(
        provider.sender(),
        { value: toNano('0.005') },
        { $$type: 'SetPublicKey', publicKey: publicKey },
    );
    const publicKeyResult = await account.getPublicKey();
    expect(publicKeyResult).toEqual(publicKey);
}

export async function sendData(provider: NetworkProvider, accountOwnerAddress: Address, encryptedData: string) {
    const account = provider.open(await Account.fromInit(accountOwnerAddress));
    await account.send(
        provider.sender(),
        { value: toNano('0.02') },
        {
            $$type: 'AddHealthData',
            accessedAddress: accountOwnerAddress,
            encryptedData: encryptedData,
        },
    );
}

export async function getRecordsCount(provider: NetworkProvider, accountOwnerAddress: Address): Promise<bigint> {
    const account = provider.open(await Account.fromInit(accountOwnerAddress));
    return await account.getNumHealthDataRecords();
}

export async function getEncryptedData(provider: NetworkProvider, accountOwnerAddress: Address, seqno: bigint): Promise<string> {
    const account = provider.open(await Account.fromInit(accountOwnerAddress));
    const recordAddress = await account.getHealthDataAddress(seqno, accountOwnerAddress);
    const record = provider.open(await HealthDataRecord.fromAddress(recordAddress));
    return await record.getEncryptedData();
}



