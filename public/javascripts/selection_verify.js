r_list = [undefined];
for (let i = 1; i <7; i++) {
    r_list.push(document.getElementsByClassName("r"+i.toString())[0]);
}
check_boxes = {};
const ids = ["de", "ita", "en", "fr", "lat", "mu", "ku", "ges", "eco", "git", "biphi", "etk", 
                "rel", "geo", "bio", "phy", "ma", "ch", "inf", "sport", "soz"];
const hours = [4, 4, 4, 4, 4, 2, 2, 3, 2, 2, 2, 2,
                2, 2, 3, 3, 4, 3, 2, 2, 2];
for (let i = 0; i < ids.length; i++) {
    const cid = ids[i];
    check_boxes[cid] = document.getElementById(cid);
}

function setgreen(el) {
    if (el.classList.contains("alert-primary")) {el.classList.remove("alert-primary");}
    if (el.classList.contains("alert-danger")) {el.classList.remove("alert-danger");}
    el.classList.add("alert-success");
}
function setred(el) {
    if (el.classList.contains("alert-primary")) {el.classList.remove("alert-primary");}
    if (el.classList.contains("alert-success")) {el.classList.remove("alert-success");}
    el.classList.add("alert-danger");
}

function count_appl(li) {
    var cnt = 0;
    li.forEach(cid => {
        if (check_boxes[cid].checked) {
            cnt++;
        }
    });
    return cnt;
}

function apply_rule(val, el) {
    if (val) {
        setgreen(el);
        return true;
    }
    else {
        setred(el);
        return false;
    }
}

function verify_all() {
    var all_apply = true;
    //Rule 1
    const sprachen = ["ita", "en", "fr", "lat"];
    var cnt = count_appl(sprachen);
    all_apply &= apply_rule(cnt >= 2 && cnt <= 4, r_list[1]);
    //Rule 2
    cnt = count_appl(["mu", "ku"]);
    all_apply &= apply_rule(cnt == 1, r_list[2]);
    //Rule 3
    cnt = count_appl(["geo", "soz"]);
    all_apply &= apply_rule(cnt <= 1, r_list[3]);
    //Rule 4
    cnt = count_appl(["rel", "etk"]);
    all_apply &= apply_rule(cnt <= 1, r_list[4]);
    //Rule 5
    cnt = count_appl(["biphi", "rel", "etk"]);
    all_apply &= apply_rule(cnt >= 1, r_list[5]);
    //Rule 6
    cnt = count_appl(["phy", "bio", "ch"]);
    all_apply &= apply_rule(cnt == 2, r_list[6]);
    //Wochenstunden
    cnt = 0;
    for (let i = 0; i < ids.length; i++) {
        if (check_boxes[ids[i]].checked) {
            cnt += hours[i];
        }        
    }
    var el = document.getElementById("hcount")
    el.innerHTML = cnt.toString();
    all_apply &= apply_rule(cnt >= 35, el);
    btn_el = document.getElementById("submit_btn");
    if (btn_el.hasAttribute("disabled") && all_apply) {
        btn_el.removeAttribute("disabled");
    }
    else if (!all_apply) {
        btn_el.setAttribute("disabled", "");
    }
}