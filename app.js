//jshint esversion:6

const express = require("express");
const mongoose=require("mongoose");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/todoDB");

const itemSchema={
  name:String, 
}
const Thing=mongoose.model("Item",itemSchema);

const item1=new Thing({
  name:"To Do List"
})

const item2=new Thing({
  name:"Adding elements to do list"
})

const item3=new Thing({
  name:"Deleting elements from list"
})
const allItems=[item1,item2,item3]








app.get("/", function(req, res) {
       
      Thing.find({})//this will find everything
      .then((data)=>{
        //if the databse is empty only the we will add data to it hence the if loop makes sure no duplicate data is added

            if(data.length===0){
                    Thing.insertMany(allItems)
                    .then((iteems)=>{
                      console.log("All Items were added Successfully",iteems)
                    mongoose.connection.close();
                    }) 
                    .catch((fault)=>{
                        console.log("Something went wrong while inserting items",fault.message)
                      })
                      //once data added to db then it needs to be shown on page so redirecting to root route
                    res.redirect("/")
      
      
            }else{
                    const day = date.getDate();
                    
                    res.render("list.ejs", {listTitle: day, newListItems: data});
            }
      })
      .catch((fault)=>{
        console.log("Some error while retreiving data",fault)
      })
      
    });
    

const listSchema={
  name:String,
  items:[itemSchema]
};
const theList=mongoose.model("list",listSchema);

//We will learn dynamic route handling
app.get("/:dynamic",(req,res)=>{
  const listName=req.params.dynamic;
  console.log(listName)
  theList.findOne({name:listName})
  .then((data)=>{
    if (!data){
      console.log("Data doesn't exists")
      //Now we are creating a new list
      const list= new theList({
       name:listName,
       items:allItems
      })
        list.save()
        res.redirect("/"+listName)
    }else{
      console.log("Data already exits")
      //list already exists
      res.render("list.ejs",{
        listTitle:listName,
        newListItems:data.items//this .items comes from data, which in turn comes from theList, which is variable  assigned to db model named list, which has a listSchema and from that schema we are getting  .items
      })
    }
  })
  .catch((fault)=>{
    console.log("Some fault",fault)
  })
  
 

})

app.post("/", (req, res)=>{
       const newTask=req.body.newItem

       const item4 =new Thing({
              name:newTask
       })
       item4.save()
       res.redirect("/")
});


app.post("/delete",(req,res)=>{
  const dell=req.body.deletion
  console.log(dell)
  Thing.findByIdAndDelete(dell)
  .then((datadel)=>{
    
    res.redirect("/")
    console.log("\n The data which was deleted--> \n\n",datadel)
  })
  .catch((fault)=>{
    console.log("Error in /delete route",fault)
  })
})





app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
