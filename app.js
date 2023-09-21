const express = require('express')
const app = express()
const port = process.env.PORT || 3000

app.set('view engine', 'ejs');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const mongoose = require("mongoose")
const { ObjectId } = mongoose.Types;

main().catch(err => console.log(err));

let defaultItems = [];
let workItems = [];

async function main() {
    try {
      //await mongoose.connect('mongodb://127.0.0.1:27017/todolistDB');
      await mongoose.connect('mongodb+srv://FrajerPista:CHY9tp9DFL8XEPnP@cluster0.en0bujs.mongodb.net/todolistDB');
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Zabudol si nazov ty kokotko hlupy."]
    }
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name: "Buy Food"
})
const item2 = new Item({
    name: "Make Food"
})
const item3 = new Item({
    name: "Eat Food"
})

defaultItems = [item1, item2, item3]

const listSchema = {
    name: String,
    items: [itemSchema]
}

const List = mongoose.model("List", listSchema);

app.get('/', async (req, res) => { 
    // const day = date.getDate();
    foundItems = await Item.find({}, 'name').exec();

    if (foundItems.length === 0) {
        try {
            await Item.insertMany(defaultItems);
              console.log('Succesfully added.');
          } catch (error) {
              console.error('Error when adding:', error);
          }
        res.redirect("/");
    } else {
        res.render("list", { listTitle: "Today", items: foundItems })
    }
})

app.get('/:customListName', async (req, res) => { 

    const customName = _.capitalize(req.params.customListName);

    try {
        let foundList = await List.findOne({name: customName}).exec();
        
        if(!foundList) {
            // Create a new list
            const list = new List({
                name: customName,
                items: defaultItems
            });
        
            await list.save();
            res.redirect("/" + customName)
        } else {
            // Show an existing list
            res.render("list", {listTitle: customName, items: foundList.items})
        }

    } catch {
        console.error('Error when adding:', error);
    }
    
});


app.post('/', async (req, res) => {

    const itemName = req.body.newItem;  // z inputu vo forme
    const listName = req.body.list;     // z buttonu vo forme

    const item = new Item({
        name: itemName
    });

    // test z ktoreho listu bol odoslany formular
    if (listName === "Today") {
        await item.save();
        res.redirect("/")
    } else {
        let foundList = await List.findOne({name: listName});
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName)
    }
})

app.post('/delete', async (req, res) => {
    const checkedItem = req.body.checkbox
    const listName = req.body.listName
    console.log(checkedItem);
    if (listName === "Today") {
        try {
            await Item.findByIdAndDelete(checkedItem)
              console.log('Succesfully removed.');
              res.redirect("/");
          } catch (error) {
              console.error('Error when removing:', error);
          }
    } else {
        try {
            var checkedItemIdObj = new ObjectId(checkedItem)  // treba pretypovat na object aby sme ho mohli vlozit ako argument 
            await List.findOneAndUpdate(
                { name: listName },
                { $pull: { items: { _id: checkedItemIdObj } } }
            );
            res.redirect("/" + listName);
          } catch (error) {
              console.error('Error when removing:', error);
          }

    }

})

app.listen(port, () => {
    console.log(`Server is listening at port ${port}`)
  })
