import "@stdlib/deploy";
import "@stdlib/ownable";
import "./messages/update_month_period_data_response";
import "./messages/update_month_period_data";
import "./messages/internal_update_month_period_data";
import "./messages/set_public_key";
import "./month_period_data";


contract Account with Deployable, Ownable {
    /// the owner of the contract
    owner: Address;
    /// the owner of the account
    accountOwner: String;
    /// the public key of the account for encryption
    publicKey: String = "";
    /// 
    numFilledMonthes: Int as uint256 = 0;
    /// {seqno: monthIndex}
    filledMonthes: map<Int, Int>;
    /// the number of access's data. This is for future logic with the access control
    numAccesses: Int as uint256 = 0;

    init(accountOwner: String) {
        self.owner = sender(); // set the owner as the deployer
        self.accountOwner = accountOwner; // set the account owner
    }

    receive(msg: SetPublicKey) {
        self.requireOwner(); //|| context().sender == self.accountOwner
        self.publicKey = msg.publicKey;
        self.reply("Public key updated".asComment());
    }

    receive(msg: UpdateMonthPeriodData) {
        self.requireOwner(); //|| context().sender == self.accountOwner
        let recordSeqno: Int = -1;
        let i : Int = 0;
        repeat (self.numFilledMonthes) {
            if (self.filledMonthes.get(i) == msg.monthIndex) {
                recordSeqno = i;
            }
            i = i + 1;
        }
        if (recordSeqno == -1) {
            recordSeqno = self.numFilledMonthes;
            self.filledMonthes.set(recordSeqno, msg.monthIndex);
            self.numFilledMonthes = self.numFilledMonthes + 1;
        }
        
        let init: StateInit = initOf MonthPeriodData(
            myAddress(),
            recordSeqno,
            msg.accessedAddress
        );
        send(SendParameters{
            to: contractAddress(init),
            body: InternalUpdateMonthPeriodData{
                    toAdd: msg.toAdd,
                    toDelete: msg.toDelete,
                }.toCell(),
            value: ton("0.008"),
            mode: SendIgnoreErrors,
            code: init.code,
            data: init.data
        });
        self.reply(UpdateMonthPeriodDataResponse{seqno: recordSeqno}.toCell());
    }

    get fun publicKey(): String {
        return self.publicKey;
    }

    get fun numFilledMonthes(): Int {
        return self.numFilledMonthes;
    }

    get fun numAccesses(): Int {
        return self.numAccesses;
    }

    get fun monthPeriodDataAddress(seqno: Int, accessedAddress: Address): Address {
        return contractAddress(
            initOf MonthPeriodData(
                myAddress(),
                seqno,
                accessedAddress
            )
        );
    }

    get fun balance(): Int {
        return myBalance();
    }

}
