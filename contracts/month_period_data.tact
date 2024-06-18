import "./messages/internal_update_month_period_data";
import "./structs/period_data_item";

contract MonthPeriodData {
    /// address of the parent contract
    parent: Address;
    /// index of the month's array
    seqno: Int as uint256;
    /// who encrypted that data and has access to it
    accessedAddress: Address;
    /// encrypted period date start. One day - one record. But 0 index not equal 1st day of month. Value is encoded date
    data: map<Int, PeriodDataItem>;

    dataArrLength: Int as uint8 = 0;

    const MaxSize: Int = 31;

    init(parent: Address, seqno: Int, accessedAddress: Address) {
        self.parent = parent;
        self.seqno = seqno;
        self.accessedAddress = accessedAddress;
    }

    fun arrPush(item: PeriodDataItem) {
        let itemIndex: Int = self.indexOf(item);
        if (itemIndex != -1) {
            return;
        }
        require(self.dataArrLength < self.MaxSize, "Data array is full");
        if (self.dataArrLength < self.MaxSize) {
            self.data.set(self.dataArrLength, item);
            self.dataArrLength = self.dataArrLength + 1;
        }
    }

    fun arrRemove(item: PeriodDataItem) {
        let itemIndex: Int = self.indexOf(item);
        if (itemIndex == -1) {
            return;
        }
        let i: Int = itemIndex;
        while (i < self.dataArrLength - 1) {
            let next: PeriodDataItem? = self.data.get(i + 1);
            self.data.set(i, next);
            i = i + 1;
        }
        self.data.set(self.dataArrLength - 1, null);
        self.dataArrLength = self.dataArrLength - 1;
    }

    fun indexOf(item: PeriodDataItem) : Int {
        let i: Int = 0;
        while (i < self.dataArrLength) {
            let arrItem: PeriodDataItem? = self.data.get(i);
            if (arrItem != null) {
                if (arrItem!!.date == item.date) {
                    return i;
                }
            }
            
            i = i + 1;
        }
        return -1;
    }

    receive(msg: InternalUpdateMonthPeriodData) {
        require(sender() == self.parent, "Parent only");
        let i: Int = 0;
        while (msg.toDelete.get(i) != null) {
            self.arrRemove(msg.toDelete.get(i)!!);
            i = i + 1;
        }
        i = 0;
        while (msg.toAdd.get(i) != null) {
            self.arrPush(msg.toAdd.get(i)!!);
            i = i + 1;
        }
        
    }

    get fun accessedAddress(): Address {
        return self.accessedAddress;
    }

    get fun dataLength(): Int {
        return self.dataArrLength;
    }

    get fun data(): map<Int, PeriodDataItem> {
        return self.data;
    }

    get fun balance(): Int {
        return myBalance();
    }

}
