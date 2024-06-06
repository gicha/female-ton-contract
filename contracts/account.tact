import "@stdlib/deploy";
import "@stdlib/ownable";
import "./messages/add_health_data_response";
import "./messages/add_health_data";
import "./messages/add_internal_health_data";
import "./messages/set_public_key";
import "./health_data_record";

contract Account with Deployable, Ownable {
    /// the owner of the contract
    owner: Address;
    /// the owner of the account
    accountOwner: String;
    /// the public key of the account for encryption
    publicKey: String = "";
    /// the number of health data records
    numHealthDataRecords: Int as uint256 = 0;
    /// the number of access's data
    numAccesses: Int as uint256 = 0;

    init(accountOwner: String) {
        self.owner = sender(); // set the owner as the deployer
        self.accountOwner = accountOwner; // set the account owner
    }

    receive(msg: SetPublicKey) {
        require(context().sender == self.owner , "Invalid sender"); //|| context().sender == self.accountOwner
        self.publicKey = msg.publicKey;
        self.reply("Public key updated".asComment());
    }

    receive(msg: AddHealthData) {
        self.numHealthDataRecords = self.numHealthDataRecords + 1;
        let init: StateInit = initOf HealthDataRecord(
            myAddress(),
            self.numHealthDataRecords,
            msg.accessedAddress
        );
        send(SendParameters{
            to: contractAddress(init),
            body: AddInternalHealthData{encryptedData: msg.encryptedData}.toCell(),
            value: ton("0.008"),   // pay for the deployment and leave some TON in the child for storage
            mode: SendIgnoreErrors,
            code: init.code,    // prepare the initial code when deploying the child contract
            data: init.data
        });
        self.reply(AddHealthDataResponse{seqno: self.numHealthDataRecords}.toCell()); // this will return excess gas to sender
    }

    get fun publicKey(): String {
        return self.publicKey;
    }

    get fun numHealthDataRecords(): Int {
        return self.numHealthDataRecords;
    }

    get fun numAccesses(): Int {
        return self.numAccesses;
    }

    get fun healthDataAddress(seqno: Int, accessedAddress: Address): Address {
        return contractAddress(initOf HealthDataRecord(myAddress(), seqno, accessedAddress));
    }

    get fun balance(): Int {
        return myBalance();
    }
}
