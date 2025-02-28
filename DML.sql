-- Query for SELECT all Customers.
SELECT * FROM Customers;

-- Query for SELECT employee information.
SELECT employeeID, firstName, lastName, hireDate, Stores.streetAddress, Positions.positionName FROM Employees
JOIN Stores ON Stores.storeID = Employees.storeID
JOIN Positions ON Positions.positionID = Employees.positionID;

-- Query for SELECT all MenuItems.
SELECT * FROM MenuItems;

-- Query for SELECT orderItem information with corresponding orderID.
SELECT orderItemID, quantity, itemPrice, MenuItems.itemName, OrderItems.orderID
FROM OrderItems
JOIN MenuItems ON MenuItems.menuID = OrderItems.menuID
WHERE OrderItems.orderID = $orderID$;

-- Query for SELECT order information.
SELECT orderID, orderDate, totalAmount, orderStatus, Stores.streetAddress,
 CONCAT(Customers.firstName, Customers.lastName)
AS customer_name FROM Orders
JOIN Stores ON Orders.storeID = Stores.storeID
JOIN Customers ON Customers.customerID = Orders.customerID;

-- Query for SELECT phone information.
SELECT phoneID, phoneCountryCode, phoneAreaCode, phoneNumber,
CONCAT(Customers.firstName, Customers.lastName) AS customer_name FROM Phones
JOIN Customers ON Customers.customerID = Phones.customerID;

-- Query for SELECT all Positions.
SELECT * FROM Positions;

-- Query for SELECT storePosition information.
SELECT storePositionID, Stores.streetAddress, Positions.positionName FROM StorePositions
JOIN Stores ON Stores.storeID = StorePositions.storeID
JOIN Positions ON Positions.positionID = StorePositions.positionID
WHERE StorePositions.storeID = $storeID$;

-- Query for SELECT all StorePositions.
SELECT storePositionID, Stores.streetAddress, Positions.positionName FROM StorePositions
JOIN Stores ON Stores.storeID = StorePositions.storeID
JOIN Positions ON Positions.positionID = StorePositions.positionID;


-- Query for SELECT all Stores.
SELECT * FROM Stores;

-- Query for INSERT Customers.
INSERT INTO Customers (firstName, lastName, email, loyaltyPoints) VALUES
($firstName$, $lastName$, $email$, $loyaltyPoints$);

-- Query for INSERT Employees.
INSERT INTO Employees (storeID, firstName, lastName, positionID, hireDate) VALUES
($storeID$, $firstName$, $lastName$, $positionID$, $hireDate$);

-- Query for INSERT MenuItems.
INSERT INTO MenuItems (itemName, description, price, category) VALUES
($itemName$, $description$, $price$, $category$);

-- Query for INSERT OrderItems.
INSERT INTO OrderItems (orderID, menuID, quantity, itemPrice) VALUES
($orderID$, $menuID$, $quantity$, $itemPrice$);

-- Query for INSERT Orders.
INSERT INTO Orders (storeID, customerID, orderDate, totalAmount, orderStatus) VALUES
($storeID$, $customerID$, $orderDate$, $totalAmount$, $orderStatus$);

-- Query for INSERT Phones.
INSERT INTO Phones (customerID, phoneCountryCode, phoneAreaCode, phoneNumber) VALUES
($customerID$, $phoneCountryCode$, $phoneAreaCode$, $phoneNumber$);

-- Query for INSERT Positions.
INSERT INTO Positions (positionName) VALUES
($positionName$);

-- Query for INSERT StorePositions.
INSERT INTO StorePositions (storeID, positionID) VALUES
($storeID$, $positionID$);

-- Query for INSERT Stores.
INSERT INTO Stores (streetAddress, city, state, zipCode, phoneNumber) VALUES
($streetAddress$, $city$, $state$, $zipCode$, $phoneNumber$);

-- Query for UPDATE StorePositions positionID as NULL.
UPDATE StorePositions
SET positionID = NULL
WHERE storeID = $selected_store$;

-- Query for UPDATE StorePositions.
UPDATE StorePositions
SET positionID = $positionID$
WHERE storeID = $selected_store$;


-- Query for UPDATE Positions.
UPDATE Positions
SET positionName = $positionName$
WHERE positionID = $selected_position$;

-- Query for DELETE StorePositions.
DELETE FROM StorePositions WHERE storeID = $storeID$ AND positionID = $positionID$ LIMIT 1;

-- Query for DELETE Positions.
DELETE FROM Positions WHERE positionID = $positionID$;
