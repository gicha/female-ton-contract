import "@stdlib/deploy";
import "@stdlib/ownable";
import "./messages/new_account";

contract Account with Deployable, Ownable {
   
    owner: Address; // the owner of the account
    publicKey: String = ""; // the public key of the account for encryption
    numMenstruations: Int as uint256 = 0; // the number of menstruation's data
    numAccesses: Int as uint256 = 0; // the number of access's data

    init() {
        self.owner = sender(); // set the owner as the deployer
    }

    receive(msg: SetPublicKey) {
        require(context().sender == self.owner, "Invalid sender");
        self.publicKey = msg.publicKey;
        self.reply();
    }

    get fun publicKey(): Int {
        return self.publicKey;
    }

    get fun numMenstruations(): Int {
        return self.numMenstruations;
    }

    get fun numAccesses(): Int {
        return self.numAccesses;
    }
}
