import "@stdlib/deploy";
import "@stdlib/ownable";
import "./messages/add_health_data";

contract HealthDataRecord with Deployable, Ownable {
    /// address of the parent contract
    parent: Address;
    /// index of the menstruation's array
    seqno: Int as uint256;
    /// who encrypted that data and has access to it
    accessedAddress: Address;
    /// encrypted data by public key of the accessedAddress
    encryptedData: String;

    init(parent: Address, seqno: Int, accessedAddress: Address) {
        self.parent = parent;
        self.seqno = seqno;
        self.accessedAddress = accessedAddress;
    }

    receive(msg: InternalHealthData) {
        require(sender() == self.parent, "Parent only");
        self.encryptedData = msg.encryptedData;
        self.reply();
    }

    get fun accessedAddress(): String {
        return self.accessedAddress;
    }

    get fun accessedAddress(): String {
        return self.accessedAddress;
    }

}
