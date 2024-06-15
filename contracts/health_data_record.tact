import "./messages/add_internal_health_data";
import "./messages/set_inactive_internal";
import "./messages/health_data_state";

contract HealthDataRecord {
    /// address of the parent contract
    parent: Address;
    /// index of the menstruation's array
    seqno: Int as uint256;
    /// who encrypted that data and has access to it
    accessedAddress: Address;
    /// encrypted period date start
    encryptedPeriodDateStart: String = "";
    /// encrypted period date end
    encryptedPeriodDateEnd: String = "";
    /// this record is active
    recordIsActive: Bool = true;

    init(parent: Address, seqno: Int, accessedAddress: Address) {
        self.parent = parent;
        self.seqno = seqno;
        self.accessedAddress = accessedAddress;
    }

    receive(msg: AddInternalHealthData) {
        require(sender() == self.parent, "Parent only");
        self.encryptedPeriodDateStart = msg.encryptedPeriodDateStart;
        self.encryptedPeriodDateEnd = msg.encryptedPeriodDateEnd;
    }

    receive(msg: SetInactiveRecordInternal) {
        require(sender() == self.parent, "Parent only");
        self.recordIsActive = false;
        send(SendParameters{
            to: msg.excess,
            value: 0,
            mode: SendRemainingBalance + SendIgnoreErrors
        });
    }

    get fun accessedAddress(): Address {
        return self.accessedAddress;
    }

    get fun healthDataState(): HealthDataState {
        return HealthDataState{ 
            encryptedPeriodDateStart: self.encryptedPeriodDateStart, 
            encryptedPeriodDateEnd: self.encryptedPeriodDateEnd,
            recordIsActive: self.recordIsActive,
        };
    }

    get fun balance(): Int {
        return myBalance();
    }
}
