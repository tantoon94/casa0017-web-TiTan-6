import { config } from 'dotenv';
import axios from 'axios';
import { insertOrupdatePlace } from '../data/dataFunctions'

config();
const apiKey = process.env.GMAP_KEY; 
const searchendpoint = process.env.GMAP_SEARCH_ENDPOINT;
const routesendpoint = process.env.GMAP_ROUTES_ENDPOINT;

// Returning the JSON API For All UCL buildings with their names and locations
export async function getUCLBuildings() {
    try {
        console.log(apiKey);
        const response = await axios.post(searchendpoint, { "textQuery" : "UCL buildings" } , {
            headers:  {
                "Content-Type" : "application/json",
                "X-Goog-Api-Key" : apiKey,
                "X-Goog-FieldMask" : "places.displayName,places.formattedAddress,places.id,places.location"
            }
        });
        return response.data;
      } 
      catch (error) {
        console.error('Error fetching UCL buildings:', error);
        throw error;
      }
}

// Returning the JSON API for All the UCL Accommodations with their names and locations
export async function getAccommodations() {
    try {
        console.log(apiKey);
        const response = await axios.post(searchendpoint, { "textQuery" : "student halls london ucl" }, {
            headers:  {
                "Content-Type" : "application/json",
                "X-Goog-Api-Key" : apiKey,
                "X-Goog-FieldMask" : "places.displayName,places.formattedAddress,places.id,places.location"
            }
        });
        return response.data;
      } 
      catch (error) {
        console.error('Error fetching UCL buildings:', error);
        throw error;
      }
}

export async function getWalkingRoutesFor(location, duration) {
        const accommodations = await getAccommodations();
        let routes = [];
        for (const accommodation of accommodations.places) {
            try {
                const response = await axios.post(routesendpoint, {
                    origin: {
                        location: {
                            latLng: location
                        }
                    },
                    destination: {
                        location: {
                            latLng: accommodation.location
                        }
                    },
                    travelMode: "WALK"
                }, {
                    headers: {
                        "Content-Type": "application/json",
                        "X-Goog-Api-Key": apiKey,
                        "X-Goog-FieldMask": "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline"
                    }
                });
                
                const resRoutes = response.data;
                for(const r of resRoutes.routes)
                {
                    console.log("Each Route:", r);
                    if (parseInt(r.duration) <= duration)
                    {
                        routes.push(r);
                    }
                }
            } catch (error) {
                throw error;
            }
            // axios.post(routesendpoint, {
            //     origin: {
            //         location: {
            //             latLng: location
            //         }
            //     },
            //     destination: {
            //         location: {
            //             latLng: accommodation.location
            //         }
            //     },
            //     travelMode: "WALK"
            // }, {
            //     headers: {
            //         "Content-Type": "application/json",
            //         "X-Goog-Api-Key": apiKey,
            //         "X-Goog-FieldMask": "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline"
            //     }
            // }).then((res) => {
            //     if (res.data.duration <= duration)
            //     {
            //         routes.push(res.data);
            //     }
            // }).catch((err) => { throw err });
        }
        return routes;
}

export async function updateDataBase() {
    var buildings = getUCLBuildings();
    for(const place in buildings.places)
    {
        insertOrupdatePlace(place, "Buildings");
    }
    var accommodations = getAccommodations();
    for(const place in accommodations.places)
    {
        insertOrupdatePlace(place, "Accommodation");
    }
    //Todo : call getWalkingRoutesFor function for each building with appropriate durations and add results to routes table
    // consider that you should write a query to get actuall database id for each place and set the actual id into forignkey columns.
}