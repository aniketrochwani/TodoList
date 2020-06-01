//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

//-------------------------------------------------------------

const app = express();

//--------------------------------------------------------------

app.set('view engine', 'ejs');

//---------------------------------------------------------------

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//-------------------------------------------------------------

mongoose.connect("mongodb://localhost:27017/todolistDB", ({ useNewUrlParser: true }, { useUnifiedTopology: true }));

//--------------------------------------------------------------

const itemSchema = {
  name: String
};

const listSchema = {
  name: String,
  items: [itemSchema]
};

//-------------------------------------------------------------

const Item = mongoose.model("Item", itemSchema);

const List = mongoose.model("List", listSchema);

//-------------------------------------------------------------

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add new items."
});

const item3 = new Item({
  name: "<--- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

//-------------------------------------------------------------

app.get("/", function (req, res) {

  Item.find({}, function (err, result) {

    if (result.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        }
        else {
          console.log("Successfullt items added to DB !");
        }
      });
      res.redirect("/")
    }
    else {
      res.render("list", { listTitle: "Today", newListItems: result });
    }
  });
});

//--------------------------------------------------------------

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }, function (err, foundItems) {
    if (foundItems ) {
        res.render("list",{listTitle:customListName, newListItems:foundItems.items});
    }
    else {
      const list = new List({
        name: customListName,
        items: defaultItems
      });

      list.save();
      res.redirect("/" + customListName );
    }
  });
});

//--------------------------------------------------------------

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName=req.body.list;
  
  const item =new Item({
    name:itemName
  });

  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
    });
    res.redirect("/"+listName);
  }

});

//--------------------------------------------------------------

// app.get("/work", function (req, res) {
//   res.render("list", { listTitle: "Work List", newListItems: workItems });
// });

//--------------------------------------------------------------

// app.get("/about", function (req, res) {
//   res.render("about");
// });

//--------------------------------------------------------------

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName=req.body.listName;


  if (listName==="Today"){
    Item.findByIdAndRemove(checkedItemId, function (err) {             //Good Method 
      if (err) {
        console.log(err);
      }
      else {
        console.log("Successfully deleted the item !!");
      }
    })
    res.redirect("/");
  }else{
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id:checkedItemId} } },function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Succesfully pulled the checked item.")
      }
      res.redirect("/"+listName);
    });
  }
  });

//--------------------------------------------------------------

app.listen(3000, function () {
  console.log("Server started on port 3000");
});



