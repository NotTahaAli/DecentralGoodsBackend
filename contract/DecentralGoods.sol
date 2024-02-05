// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

contract DecentralGoods {
    
    enum OrderStatus {
        Pending,
        Refunded,
        Completed
    }

    struct Order {
        OrderStatus _status;
        uint _amount;
        uint _listingId;
        uint _quantity;
        address payable _buyer;
    }

    struct Listing {
        uint _price;
        uint _quantity;
        address payable _seller;
    }

    mapping (uint=>Order) orders;
    mapping (uint=>Listing) listings;
    uint public lastOrder = 0;
    uint64 public lastListing = 0;

    event OrderCreated(uint _orderId, address _seller);

    event listingCreated(uint _listingId, address _seller);

    event FundsReleased(uint _orderId, address _reciever);

    function listItem(uint _price, uint _quantity) public returns (uint listingId) {
        require(_price > 0, "Listing price can not be 0");
        listingId = ++lastListing;
        listings[listingId]._seller = payable(msg.sender);
        listings[listingId]._price = _price;
        listings[listingId]._quantity = _quantity;
        emit listingCreated(listingId, msg.sender);
    }

    function changeStock(uint _listingId, uint _quantity) public {
        require(_listingId <= lastListing, "Listing does not exist.");
        require(msg.sender == listings[_listingId]._seller, "You do not own this listing.");
        listings[_listingId]._quantity = _quantity;
    }

    function changePrice(uint _listingId, uint _price) public {
        require(_price > 0, "Listing price can not be 0");
        require(_listingId <= lastListing, "Listing does not exist.");
        require(msg.sender == listings[_listingId]._seller, "You do not own this listing.");
        listings[_listingId]._price = _price;
    }

    function buyItem(uint _listingId, uint _quantity) public payable returns (uint orderId) {
        require(_listingId <= lastListing, "Listing does not exist.");
        require(listings[_listingId]._quantity >= _quantity, "Item does not have enough stock.");
        require(msg.sender != listings[_listingId]._seller, "You can not buy your own item");
        require(msg.value >= _quantity * listings[_listingId]._price, "Not enough money to buy");
        if (msg.value > _quantity * listings[_listingId]._price) {
            payable(msg.sender).transfer(msg.value - (_quantity * listings[_listingId]._price));
        }
        orderId = ++lastOrder;
        orders[orderId]._amount = _quantity * listings[_listingId]._price;
        orders[orderId]._listingId = _listingId;
        orders[orderId]._quantity = _quantity;
        orders[orderId]._buyer = payable(msg.sender);
        listings[_listingId]._quantity -= _quantity;
        emit OrderCreated(orderId, listings[_listingId]._seller);
    }

    function itemRecieved(uint _orderId) public {
        require(orders[_orderId]._status == OrderStatus.Pending, "Order is not pending.");
        require(orders[_orderId]._buyer == msg.sender, "You are not the buyer.");
        orders[_orderId]._status = OrderStatus.Completed;
        listings[orders[_orderId]._listingId]._seller.transfer(orders[_orderId]._amount);
        emit FundsReleased(_orderId, listings[orders[_orderId]._listingId]._seller);
    }

    function refund(uint _orderId) public {
        require(orders[_orderId]._status == OrderStatus.Pending, "Order is not pending.");
        require(listings[orders[_orderId]._listingId]._seller == msg.sender, "You are not the seller.");
        orders[_orderId]._status = OrderStatus.Refunded;
        orders[_orderId]._buyer.transfer(orders[_orderId]._amount);
        listings[orders[_orderId]._listingId]._quantity += orders[_orderId]._quantity;
        emit FundsReleased(_orderId, orders[_orderId]._buyer);
    }

    function getListingInfo(uint _listingId) public view returns (uint _price, uint _quantity, address _seller) {
        require(_listingId <= lastListing, "Listing does not exist");
        _price = listings[_listingId]._price;
        _quantity = listings[_listingId]._quantity;
        _seller = listings[_listingId]._seller;
    }

    function getOrderInfo(uint _orderId) public view returns (OrderStatus _status, uint _amount, uint _listingId, uint _quantity, address _buyer) {
        require(_orderId <= lastOrder, "Order does not exist");
        _status = orders[_orderId]._status;
        _amount = orders[_orderId]._amount;
        _listingId = orders[_orderId]._listingId;
        _quantity = orders[_orderId]._quantity;
        _buyer = orders[_orderId]._buyer;
    }
}