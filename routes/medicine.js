import Joi from 'joi';

const Medicine = [{
    method: ['GET'],
    path: '/medication/medicine/{id?}',
    config: { 
        auth: false,
        handler: function(request, reply) {
            let id = encodeURIComponent(request.params.id);

            if (id != 'undefined' ) {
                let select = `
                SELECT
                    id, data
                FROM
                    medicamentos
                WHERE 
                    data ->> 'resourceType' = 'Medication'
                AND
                    id = '${id}';`;

                request.pg.client.query(select, function(err, result) {
                    if (err) throw err
                    
                    
                    if(result.rows[0]) {
                        let medicine = result.rows[0].data;
                        medicine.id = id;

                        if (result.rows[0].data.rules.concurrentUseList.length > 0 ) {    
                            let concurrentUseList = JSON.stringify(result.rows[0].data.rules.concurrentUseList);
                            let r1 = concurrentUseList.replace("[", "(");
                            let r2 = r1.replace("]", ")");
                            
                            let select2 = `
                            SELECT
                                data ->> 'name' AS name
                            FROM
                                medicamentos
                            WHERE
                                id IN ${r2}
                            AND 
                                data ->> 'status' = 'active'
                            `;
    
                            request.pg.client.query(select2, function(err2, result2) {
                                if (err2) throw err2
    
                                let textConcurrentUseList = [];
                                
                                result2.rows.forEach(function(element, index) {
                                    textConcurrentUseList.push(element.name)
                                });
    
                                medicine.rules.concurrentUseList = textConcurrentUseList;
    
                                medicine.id = result.rows[0].id;
    
                                let select3 = `
                                SELECT
                                    id, data
                                FROM
                                    medicines_core
                                WHERE 
                                    data ->> 'resourceType' = 'Presentations';
                                `;
                                request.pg.client.query(select3, function(err2, result3) {
                                    reply.view('medicine', { medicine: JSON.stringify(medicine), core: JSON.stringify(result3.rows[0]) });
                                });
                            });
                        } else {
                            let select3 = `
                            SELECT
                                id, data
                            FROM
                                medicines_core
                            WHERE 
                                data ->> 'resourceType' = 'Presentations';
                            `;
                            request.pg.client.query(select3, function(err2, result3) {
                                reply.view('medicine', { medicine: JSON.stringify(medicine), core: JSON.stringify(result3.rows[0]) });
                            });

                            
                        }
                        

                    } else {
                        reply.view('medicine', { medError: 'noExist' });
                    }
                });
            } else {
                return reply.view('medicine', { medError: 'noSended' });
            }             
        }
    }
},
{
    method: ['GET'],
    path: '/medication/medicine/',
    config: { 
        auth: false,
        handler: function(request, reply) {
            return reply.view('medicine', { medError: 'noSended' });         
        }
    }
}];

export default Medicine;