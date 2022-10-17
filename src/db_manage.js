var db = require("../src/db");

async function register(rgsusername, rgsisadmin, rgspwd, rgssalt) {
    var result = await db.query(`INSERT INTO userdata (username, isadmin, pwd, salt) VALUES ($1, $2, $3, $4);`, [rgsusername, rgsisadmin, rgspwd, rgssalt])
    if (result.rowCount === 0) {
        return false;
    }
    else return true;
}
async function update_pwd(userid, newpwd, newsalt) {
    var result = await db.query(`UPDATE userdata SET pwd = $2, salt = $3 WHERE userid = $1`, [userid, newpwd, newsalt])
    if (result.rowCount === 0) {
        return false;
    }
    return true;
}
async function update_isadmin(userid, isadmin) {
    var result = await db.query(`UPDATE userdata SET isadmin = $1 WHERE userid = $2`, [isadmin, userid])
    if (result.rowCount === 0) {
        return false;
    }
    return true;
}
async function delete_user(userid) {
    let ans = false
    try {
        const client = await db.connect()
        try {
            await client.query('BEGIN')
            await client.query('DELETE FROM selections WHERE userid = $1', [userid])
            await client.query("DELETE FROM userdata WHERE userid = $1", [userid])
            await client.query('COMMIT')
            ans = true
        } catch (e) {
            await client.query('ROLLBACK')
            throw e
        } finally {
            client.release()
        }
    } catch (error) {
        console.log(error.stack)
    }
    return ans

}
async function get_selection(userid) {
    var result = (await db.query(`SELECT * FROM selections WHERE userid = $1`, [userid])).rows[0];
    return result;
}
async function set_selection_alt(userid, sel) {
    let f = s => sel[s]!==undefined;
    return set_selection(userid, 
        f("de"), f("ita"), f("en"), f("fr"), f("lat"), f("mu"), f("ku"), 
        f("ges"), f("eco"), f("git"), f("biphi"), f("etk"), f("rel"), f("geo"),
        f("bio"), f("phy"), f("ma"), f("ch"), f("inf"), f("sport"), f("soz"));
}
async function set_selection(userid, de, ita, en, fr, lat, mu, ku, ges, eco, git, biphi, etk, rel, geo, bio, phy, ma, ch, inf, sport, soz) {
    var result = await db.query("UPDATE selections SET de=$1, ita=$2, en=$3, fr=$4, lat=$5, "+ 
                                "mu=$6, ku=$7, ges=$8, eco=$9, git=$10, biphi=$11, etk=$12, "+
                                "rel=$13, geo=$14, bio=$15, phy=$16, ma=$17, ch=$18, inf=$19, sport=$20, soz=$21 "+
                                "WHERE userid=$22", 
                                [de, ita, en, fr, lat, mu, ku, ges, eco, git, biphi, etk, 
                                    rel, geo, bio, phy, ma, ch, inf, sport, soz, userid])
    if (result.rowCount === 0) {
        return false;
    }
    return true;
}
async function user_by_name(username) {
    var result = await db.query(`SELECT * FROM userdata WHERE username LIKE $1;`, [username])
    if (result.rowCount === 0) {
        return undefined;
    }
    return result.rows[0];
}
async function user_by_userid(userid) {
    var result = await db.query(`SELECT * FROM userdata WHERE userid = $1`, [userid])
    if (result.rowCount === 0) {
        return undefined;
    }
    return result.rows[0];
}

module.exports = { register, update_pwd, update_isadmin, delete_user, get_selection, set_selection, set_selection_alt, register, user_by_name, user_by_userid};