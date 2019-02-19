const axios = require('axios')
const qs  = require('querystring')

var searchOrganisation = async function(organisation, location){
    var codingOrg = qs.escape(organisation)
    var request = `https://search-maps.yandex.ru/v1/?text=${codingOrg}&ll=${location}&results=100&lang=ru_RU&apikey=${process.env.YANDEXTOKEN}`
    var result = []
    try { 
        var response = await axios.get(request)
    } catch(error){
        console.log(error)
    }
    for(var i = 0; i < response.data.features.length; i++){
        if(response.data.features[i].properties.CompanyMetaData.Hours != undefined){
            if(response.data.features[i].properties.CompanyMetaData.Hours.State.is_open_now == '1'){
                var bill = ""
                var vkLink = ""
                if(response.data.features[i].properties.CompanyMetaData.Snippet != undefined){
                    bill = findBill(response.data.features[i].properties.CompanyMetaData.Features)
                }
                if(response.data.features[i].properties.CompanyMetaData.Links != undefined){
                    vkLink = findGroup(response.data.features[i].properties.CompanyMetaData.Links)
                }
                var obj = {
                    name : response.data.features[i].properties.CompanyMetaData.name,
                    address : response.data.features[i].properties.CompanyMetaData.address,
                    time : response.data.features[i].properties.CompanyMetaData.Hours.text,
                    state : response.data.features[i].properties.CompanyMetaData.Hours.State.text,
                    geo : response.data.features[i].geometry.coordinates,
                    bill : bill,
                    vkLink : vkLink
                }
                result.push(obj)
            }
        }
    }
    return result
}

function findBill(featureSet){
    var ind = -1
    for(var i = 0; i < featureSet.length; i++){
        if(featureSet[i].id == 'average_bill2'){
            ind = i
            break
        }
    }
    if(ind != -1){
        return featureSet[ind].value
    } else {
        return '-'
    }
}

function findGroup(linksSet) {
    var res = '-'
    for (var i = 0; i < linksSet.length; i++){
        if(linksSet[i].aref == '#vkontakte'){
            res = linksSet[i].href
        }
    }
    return res
}


module.exports = searchOrganisation