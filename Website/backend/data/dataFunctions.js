import db from './databaseconnection'

const placeTypes = {
    Building: 0,
    Accommodation: 1
}

function insertOrupdatePlace(place, placetype) {
   var countofplace = db.query(`Select Count(*) from places Where googleid = ${place.id}`);
   if (countofplace === 0)
   {
    db.query(
        `Insert Into places (googleid, name, placetype, address, latitude, longitude) 
            values (${place.id}, ${place.displayname}, ${placetype}, ${place.formattedAddress}, 
            ${place.location.latitude}, ${place.location.longitude}`
    );
   }
   else{
    db.query(
        `Update placesplaces Set name = ${place.displayname}, 
                placetype = ${placetype}, 
                address = ${place.formattedAddress}, 
                latitude = ${place.location.latitude}, 
                longitude = ${place.location.longitude}
            Where googleid = ${place.id}`
    );
   }
}