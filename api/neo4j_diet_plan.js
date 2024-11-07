const neo4j = require('neo4j-driver');

class Neo4jConnection {
    constructor(uri, user, password) {
        this.driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
    }

    async close() {
        await this.driver.close();
    }

    async query(query, parameters = {}) {
        const session = this.driver.session();
        try {
            const result = await session.run(query, parameters);
            return result.records.map(record => record.toObject());
        } finally {
            await session.close();
        }
    }
}

async function create_user_taste_graph(conn, gmail) {
    const create_user_query = `
    MERGE (u:User {gmail: $gmail})
    WITH u
    FOREACH (taste IN ['sweet', 'sour', 'bitter', 'umami'] | 
        MERGE (t:Taste {name: taste})
        MERGE (u)-[:LIKES {weight: 2.5}]->(t)
    )
    `;
    await conn.query(create_user_query, { gmail });
}

async function update_taste_weight(conn, user_id, taste_category, weight) {
    const update_weight_query = `
    MATCH (u:User {gmail: $user_id})-[r:LIKES]->(t:Taste {name: $taste_category})
    SET r.weight = $weight
    `;
    conn.query(update_weight_query, {
        user_id: user_id,
        taste_category: taste_category,
        weight: weight
    });
}

async function get_user_taste_weights(conn, gmail) {
    const get_weights_query = `
    MATCH (u:User {gmail: $gmail})-[r:LIKES]->(t:Taste)
    RETURN t.name AS taste, r.weight AS weight
    `;
    const result = await conn.query(get_weights_query, { gmail });
    return result;
}

module.exports = {
    Neo4jConnection,
    create_user_taste_graph,
    update_taste_weight,
    get_user_taste_weights
};
