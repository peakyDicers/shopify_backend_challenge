var request = require("request");

let url = "https://backend-challenge-summer-2018.herokuapp.com/challenges.json?id=1&page=1";
let data = null;
request({
  url: url,
  json: true,
}, (error, response, body) => {
  url = "https://backend-challenge-summer-2018.herokuapp.com/challenges.json?id=1&page=";
  req2(body, url, 2);
})

let req2 = (data, nextUrl, pageNum) => {
  request({
    url: url + pageNum,
    json: true,
  }, (error, response, body) => {

    data.menus.push.apply(data.menus, body.menus);
    console.log('*****');
    console.log(body.menus, pageNum);
    console.log('*****');
    //console.log(data.pagination.current_page);
    if (pageNum == data.pagination.total) {
      console.log("last page reached");
      filterMenu(data);
    } else {
      pageNum++;
      req2(data, url, pageNum);
    }

  })
}


let filterMenu = (response) => {
  console.log("the response", response);

  let result = {
    "valid_menus": [],
    "invalid_menus": [],
  }
  
  let filteredMenu = {
    "root_id": null,
    "children": null,
  }

  let checkedIDs = [-1];

  //goes through all 15 menus.
  for (let i = 0; i < response.menus.length; i++) {
    console.log(response.menus[i]);
    currentID = i + 1;

    //goes through all IDs that have already been checked.
    for (let j = 0; j < checkedIDs.length; j++) {
      console.log("check currentID: ", currentID, " against : ", checkedIDs[j])
      if (currentID == checkedIDs[j]) {
        console.log("MATCH FOUND: skipping currentID #", currentID);
        break;
      }

      //If this ID has not been checked yet. Check it for a loop.
      if (j == checkedIDs.length - 1) {
        let children = checkLoop([], currentID, response.menus)
        checkedIDs.push.apply(checkedIDs, children);
        console.log("No loop found in: ", currentID);
        filteredMenu = {
          "root_id": currentID,
          "children": children,
        } 
        let loop = false;
        for (let k = 0; k < children.length; k++){
          if (currentID == children[k]){
            loop = true;
            break;
          }
        }
        loop ? result.invalid_menus.push(filteredMenu) : result.valid_menus.push(filteredMenu);
        
        break;
      }
    }

  }
  console.log("===============================")
  console.log(JSON.stringify(result, null, 4));
  return result;
}
//==================================================

//parameters: (array, num, obj)
let checkLoop = (children, id, menus) => {
  let counter = 0;
  for (let i = 0; i < children.length; i++) {
    console.log("id #", id, " matches child ", children[i], " returning now.");
    if (id == children[i])
      counter++;
    if (counter == 2) {
      children.splice(children.length-1,1)
      return children;
    }
  }
  //goes through all menus, finds matching ID.
  for (let i = 0; i < menus.length; i++) {
    if (menus[i].id == id) {
      //goes through all children.
      let child_id = menus[i].child_ids; //child_id is array of children.

      if (child_id.length == 0) return children;
      else {
        for (let j = 0; j < child_id.length; j++) {
          children.push(child_id[j]);
          console.log("going deeper with: ", child_id[j], "children accumulated: ", children);
          children = checkLoop(children, child_id[j], menus);

        }
      }
    }
  }
  return children;
}

