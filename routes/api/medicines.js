import Joi from 'joi';

const medicines = [
{
    method: 'GET',
    path: '/medication/api/medicines',
    handler: function(request, reply) {

        let select = `
        SELECT
            id,
            data ->> 'name' AS name
        FROM
            medicamentos
        WHERE 
            data ->> 'resourceType' = 'Medication';
        `;

        request.pg.client.query(select, function(err, result) {
            if (err) throw err
            
            if(result.rows[0]) {
                let arr = [];
                result.rows.forEach(function(element, i) {
                   arr.push(element); 
                });
                console.log(arr);
                return reply(arr);
                
            } else {
                return reply({error: 'no existen medicamentos en la base de datos'});
            }
            
            
        });
    }
},
{
    method: 'POST',
    path: '/medication/api/medicines/search',
    config: {
        handler: (request, reply) => {
            let name = request.payload.name;
            
            let select = `
            SELECT
                id,
                data ->> 'name' AS name
            FROM
                medicamentos
            WHERE 
                data ->> 'resourceType' = 'Medication'
            AND
                data ->> 'name' ILIKE '%${name}%';`;

            request.pg.client.query(select, function(err, result) {
                if (err) throw err
                let arr = [];
                
                console.log(result.rows)
                /*
                result.rows.forEach(function(element, i) {
                   arr.push(element.name); 
                });
                console.log(arr);
                return reply(arr);
                */
                return reply(result.rows);
            });
        },
        validate: {
            payload: Joi.object().keys({
                name: Joi.string()
            })
        }
    }
},
{
    method: 'POST',
    path: '/medication/api/medicines/select',
    config: {
        handler: (request, reply) => {
            let name = request.payload.name;
            
            let select = `
            SELECT
                data
            FROM
                medicamentos
            WHERE 
                data ->> 'resourceType' = 'Medication'
            AND
                data ->> 'name' = '${name}';`;

            request.pg.client.query(select, function(err, result) {
                if (err) throw err
                
                if(result.rows[0]) {
                    return reply(result.rows[0].data);
                } else {
                    return reply('none');
                }
                
            });
        },
        validate: {
            payload: Joi.object().keys({
                name: Joi.string()
            })
        }
    }
},
{
    method: 'POST',
    path: '/medication/api/medicines/new',
    config: {
        handler: (request, reply) => {
            let name = request.payload.name;

            let defaultMedData = {
                code: null,
                name: name,
                form:[
                    {
                        measureQty: [
                            "200",
                            "400",
                            "600"
                        ],
                        measureUnit:"mg",
                        presentation:"tablet"
                    },
                    {
                        measureQty: [
                            "200",
                            "400",
                            "600"
                        ],
                        measureUnit:"mg",
                        presentation:"capsule"
                    }
                ],
                image:[
                    {link:"https://google.com"}
                ], 
                rules: { 
                    textList: [
                    ],
                    templates: [
                        { 
                            days:7,
                            dose:1,
                            name:"default",
                            status:"active",
                            limitQty:30,
                            triggers: {
                                age: {
                                    max:200,
                                    min:0
                                },
                                sex:"male"
                            },
                            frequency:6,
                            measureQty:"400 mg",
                            presentation:"tablet"
                        },
                    ],
                    concurrentUseList:[]
                },
                status:"active",
                isBrand:null,
                package:null,
                ingredient:null,
                manufacturer:null,
                resourceType:"Medication",
                isOverTheCounter:null
            }

            let insert = `
                INSERT INTO medicamentos (id, data) VALUES (default, '${JSON.stringify(defaultMedData)}') RETURNING id;
            `

            request.pg.client.query(insert, function(err, result) {
                if (err) throw err
                
                console.log(result)
                return reply({id: result.rows[0].id});
            });
                  
        },
        validate: {
            payload: Joi.object().keys({
                name: Joi.string()
            })
        }
    }
},
{
    method: 'PUT',
    path: '/medication/api/medicines',
    config: {
        handler: (request, reply) => {
            let medicine = JSON.parse(request.payload.medicine);
            let id = medicine.id;

            delete medicine.id;

            if (medicine.rules.concurrentUseList.length > 0) {
                let textConcurrentUseList = JSON.stringify(medicine.rules.concurrentUseList);
                let r1 = textConcurrentUseList.replace("[", "(");
                let r2 = r1.replace("]", ")");
                let r3 = r2.split('"').join("'")
                
                let select = `
                SELECT
                    id
                FROM
                    medicamentos
                WHERE
                    data ->> 'name' IN ${r3}
                AND 
                    data ->> 'status' = 'active'
                `;
    
                request.pg.client.query(select, function(err, result) {
                    if (err) throw err
    
                    let concurrentUseList = [];
                    
                    result.rows.forEach(function(element, index) {
                        concurrentUseList.push(element.id)
                    });
    
                    medicine.rules.concurrentUseList = concurrentUseList;
                    let medicineString = JSON.stringify(medicine);
                    let update = `
                    UPDATE
                        medicamentos
                    SET
                        data = '${medicineString}'
                    WHERE 
                        data ->> 'resourceType' = 'Medication'
                    AND
                        id = '${id}';`;
        
                    request.pg.client.query(update, function(err2, result2) {
                        if (err2) throw err2
                        
                        return reply(result2.rowCount);
                    });
    
                    
                });
            } else {
                let medicineString = JSON.stringify(medicine);

                console.log(medicineString);
                
                let update = `
                UPDATE
                    medicamentos
                SET
                    data = '${medicineString}'
                WHERE 
                    data ->> 'resourceType' = 'Medication'
                AND
                    id = '${id}';`;
    
                request.pg.client.query(update, function(err, result) {
                    if (err) throw err
                    
                    console.log(result)
                    return reply(result.rowCount);
                });
                
            }

        },
        validate: {
            payload: Joi.object().keys({
                medicine: Joi.string()
            })
        }
    }
}
];

export default medicines;