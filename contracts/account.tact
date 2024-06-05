import "@stdlib/deploy";
import "@stdlib/ownable";
import "./messages/new_account";
import "./health_data_record";

contract Account with Deployable, Ownable {
    /// the owner of the account
    owner: Address; 
    /// the public key of the account for encryption
    publicKey: String = "";
    /// the number of health data records
    numHealthDataRecords: Int as uint256 = 0;
    /// the number of access's data
    numAccesses: Int as uint256 = 0;

    init() {
        self.owner = sender(); // set the owner as the deployer
    }

    receive(msg: SetPublicKey) {
        require(context().sender == self.owner, "Invalid sender");
        self.publicKey = msg.publicKey;
        self.reply();
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
            body: InternalSetTask{task: msg.task}.toCell(),
            value: ton("0.0001"),   // pay for the deployment and leave some TON in the child for storage
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
}
