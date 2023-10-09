const Order = require("./assignment2Order");

const OrderState = Object.freeze({
    WELCOMING:   Symbol("welcoming"),
    MENULIST: Symbol("menulist"),
    SIZE:   Symbol("size"),
    TOPPINGS:   Symbol("toppings"),
    DESSERTS: Symbol("desserts"),
    DRINKS:  Symbol("drinks"),
    PAYMENT: Symbol("payment"),
});

module.exports = class ShwarmaOrder extends Order{
  constructor(sNumber, sUrl){
      super(sNumber, sUrl);
      this.stateCur = OrderState.WELCOMING;  
      this.sPickItem = "";
      this.sSize = "";
      this.sToppings = "";
      this.sDesserts = "";
      this.sDrinks = "";
      this.sItem = ["Pasta", "Sandwich"];
  }
  handleInput(sInput){
    let aReturn = [];
    switch(this.stateCur){
        case OrderState.WELCOMING:
            this.stateCur = OrderState.MENULIST;
            aReturn.push("Welcome to Devika's Restaurant.");
            aReturn.push("Please pick the item from Menu List");
            aReturn.push("1.Pasta");
            aReturn.push("2.Sandwich");
            break;
            case OrderState.MENULIST:
                if (sInput === "1" || sInput.toLowerCase() === "Pasta") {
                    this.sPickItem = "Pasta";
                    this.stateCur = OrderState.SIZE;
                    aReturn.push("Please select the size of pasta box?");
                    aReturn.push("small ($8.00), Medium ($12.00), Large ($16.00)");
                } 
                else if (sInput === "2" || sInput.toLowerCase() === "Sandwich") {
                    this.sPickItem = "Sandwich";
                    this.stateCur = OrderState.SIZE;
                    aReturn.push("Please select the size of Sandwich ?");
                    aReturn.push("small ($4.50), Medium ($6.00), Large ($10.00)");
                }
                else {
                    aReturn.push("Invalid menu selected, please select either Pasta or Sandwich");
                }
                break;

            case OrderState.SIZE:
                this.sSize = sInput.toLowerCase();
                if(this.sSize === "small" || this.sSize === "medium"|| this.sSize === "large")
                {
                    this.stateCur = OrderState.TOPPINGS;
                    aReturn.push("What toppings would you like?, if yes, please provide which toppings you want.");
                }
                else{
                    aReturn.push("Invalid item please select the correct size.");
                }
                
                break;     
            case OrderState.TOPPINGS:
                this.stateCur = OrderState.DESSERTS
                this.sToppings = sInput;
                aReturn.push("Would you like to add Desserts?, if yes, please select Icecream or Sweet.");
                break;
            case OrderState.DESSERTS:
                this.sDesserts = sInput;
                this.stateCur = OrderState.DRINKS;
                aReturn.push("Would you like to add drinks?if yes, please select Pepsi or Coke.");
                break;
            case OrderState.DRINKS:
                this.stateCur = OrderState.PAYMENT;
                this.nOrder = this.PriceCalculator();
                this.sDrinks = sInput;
                aReturn.push("Thank you for order with us!");
                aReturn.push(`your Order deatils:\n Item: ${this.sPickItem} \n Size: ${this.sSize} \n Toppings: ${this.sToppings} \n Dessert: ${this.sDesserts} \n Drinks:${this.sDrinks}`);
                aReturn.push(`Please pay for your order using the link`);
                aReturn.push(`${this.sUrl}/payment/${this.sNumber}/`);
                break;
                case OrderState.PAYMENT:
                  this.isDone(true);
                  let Price = this.PriceCalculator();
                  aReturn.push(`Order Price: $${Price.toFixed(2)}`);
                  let d = new Date(); 
                  d.setMinutes(d.getMinutes() + 30);
                  aReturn.push(`Your payment was successful!`);
                  aReturn.push(`Please pick it up at ${d.toTimeString()}`);
                  aReturn.push(`order deliver to  \n${this.addressSetup(sInput.purchase_units[0].shipping)}`);
                  break;
          }
          return aReturn;
    }
    renderForm(sTitle = "-1", sAmount = "-1"){
      if(sTitle != "-1"){
        this.sItem = sTitle;
      }
      if(sAmount != "-1"){
        this.nOrder = sAmount;
      }
      const sClientID = process.env.SB_CLIENT_ID || 'AQFW7EfdLwumxRCVpo95uo91JXTHL1LBGCwyKtjdEYP_QJPtrxQ1prlGum7ItlQOZOzYExDEtKyyG_AV'
      return(`
      <!DOCTYPE html>
  
      <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      </head>
      
      <body>
        <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
        <script
          src="https://www.paypal.com/sdk/js?client-id=${sClientID}">
        </script>
        Thank you ${this.sNumber} for your ${this.sItem} order of $${this.nOrder}.
        <div id="paypal-button-container"></div>
  
        <script>
          paypal.Buttons({
              createOrder: function(data, actions) {
                return actions.order.create({
                  purchase_units: [{
                    amount: {
                      value: '${this.nOrder}'
                    }
                  }]
                });
              },
              onApprove: function(data, actions) {
                return actions.order.capture().then(function(details) {
                  $.post(".", details, ()=>{
                    window.open("", "_self");
                    window.close(); 
                  });
                });
              }
          
            }).render('#paypal-button-container');
        </script>
      </body>
      `);
  
    }

    PriceCalculator() {
      let initialPrice = 0;

      switch (this.sPickItem) {
          case "Pasta":
              switch (this.sSize.toLowerCase()) {
                  case "small":
                      initialPrice = 8.00;
                      break;
                  case "medium":
                      initialPrice = 12.00;
                      break;
                  case "large":
                      initialPrice = 16.00;
                      break;
              }
              break;

          case "Sandwich":
              switch (this.sSize.toLowerCase()) {
                  case "small":
                      initialPrice = 4.50;
                      break;
                  case "medium":
                      initialPrice = 6.00;
                      break;
                  case "large":
                      initialPrice = 10.00;
                      break;
              }
              break;

          default:
              break;
      }
      let finalPrice = initialPrice;
      return finalPrice;
  }

  addressSetup(addressObj) {
      const {
        address: {
          address_line_1,
          address_line_2,
          admin_area_2,
          admin_area_1,
          postal_code,
          country_code,
        },
      } = addressObj;

    const addressLines = [];

    if (address_line_1) {
      addressLines.push(address_line_1);
    }
    if (address_line_2) {
      addressLines.push(address_line_2);
    }

    const cityStatePostal = `${admin_area_2}, ${admin_area_1} ${postal_code}`;
    addressLines.push(cityStatePostal);

    if (country_code) {
      addressLines.push(country_code);
    }

    const address = addressLines.join("\n");

    return address;
    }
};
