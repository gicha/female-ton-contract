
import { Cell, beginCell } from '@ton/ton';
import { storeDeploy } from '../wrappers/Account';


export function getDeployPayload(): Cell {
    return beginCell().store(storeDeploy({
        $$type: 'Deploy',
        queryId: 0n,
    })).endCell();
}

// export async function deploy(sender: Sender, accountOwnerAddress: Address) {
//     const init = await Account.init(accountOwnerAddress);
//     console.log(init.code.toBoc().toString("base64"));


//     const contract = await Account.fromInit(accountOwnerAddress);
//     const provider = client.provider(contract.address, { code: init.code, data: init.data });
//     await contract.send(provider, sender, { value: toNano('0.004') }, { $$type: 'Deploy', queryId: 0n });
//     console.log(await client.isContractDeployed(contract.address)); // false
//     const openedContract = client.open(contract);
//     await openedContract.send(
//         sender,
//         { value: toNano('0.01') },
//         {
//             $$type: 'Deploy',
//             queryId: 0n,
//         }
//     );
//     // console.log(await client.isContractDeployed(openedContract.address)); // false
// }


// export async function setPublicKey(sender: Sender, accountOwnerAddress: Address, publicKey: string) {
//     const contract = await Account.fromInit(accountOwnerAddress);
//     const openedContract = client.open(contract);
//     await openedContract.send(sender, { value: toNano('0.005') }, { $$type: 'SetPublicKey', publicKey: publicKey })
//     // const publicKeyResult = await openedContract.getPublicKey();
//     // expect(publicKeyResult).toEqual(publicKey);
// }

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



