import "./messages/add_internal_health_data";

contract HealthDataRecord {
    /// address of the parent contract
    parent: Address;
    /// index of the menstruation's array
    seqno: Int as uint256;   
    /// who encrypted that data and has access to it
    accessedAddress: Address;
    /// encrypted data by public key of the accessedAddress
    encryptedData: String = "";

    init(parent: Address, seqno: Int, accessedAddress: Address) {
        self.parent = parent;
        self.seqno = seqno;
        self.accessedAddress = accessedAddress;
    }

    receive(msg: AddInternalHealthData) {
        require(sender() == self.parent, "Parent only");
        require(self.encryptedData == "", "Data already set");
        self.encryptedData = msg.encryptedData;
    }

    get fun accessedAddress(): Address {
        return self.accessedAddress;
    }

}
