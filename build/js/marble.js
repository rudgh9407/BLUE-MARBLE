$(document).ready(()=>{

  class User_module {
    constructor(_id, _code){
      this.id = _id;
      this.code = _code;
      this.money = 1000000;
      this.land = [];
      this.standing = 0;
      this.state_island = 0;
      this.state_tax_set = 0;
      this.state_tax_get = 0;
      this.state_olympic = 0;
      this.state_travel = 0;
      this.rotate_count = 0;
      this.win_count = 0;
      this.loss_count = 0;
    }
  }
  let user_module_1;
  let user_module_2;

  class Place_module {
    constructor(_JSON){
      this.id = _JSON.id;
      this.name = _JSON.name;
      this.owner = "none";
      this.level = [1, 0, 0, 0];
      this.set_level = [0, 0, 0, 0];
      this.island_level = 0;
      this.build_cost = _JSON.build_cost;
      this.pass_cost = _JSON.pass_cost;
      this.take_cost = _JSON.take_cost;
      this.sell_cost = _JSON.sell_cost;
      this.color = _JSON.color;
      this.type = _JSON.type;
      this.event = 1; // 올림픽 1, 2 유무
      this.sell_check = 0;
    }
    sell_land = () => {
      this.owner = "none";
      this.level = [1, 0, 0, 0];
      this.set_level = [0, 0, 0, 0];
      this.island_level = 0;
      this.event = 1;
      this.sell_check = 0;
      for(let i=0; i<program.last_list.length; i++){
        if(program.last_list[i].name == this.name){
          gsap.to($(`.pos_${i}>div>article:nth-child(2)>div`), {scale: 0});
          break;
        }
      }
    }
  }

  //----------------------------
  class Program_module {
    constructor(_data_JSON){
      this.data_JSON = _data_JSON;
      this.land_list = [];      //--- 발판 각각 Class 담는 배열
      this.check_list = [];     //--- 발판 순서 확인용 배열
      this.last_list = [];      //--- 최종 발판 순서대로 정렬
      this.owner_list = [];     //--- 땅 주인 목록
      this.move_count = [0, 0];     //--- 유저 1,2 모듈러스 진행전 총 눈금 수
      this.move_gap = [0, 0];     //--- 유저 1,2 주사위 눈금 
      this.equal_dice = [0, 0];   //--- 주사위 눈금 같은수인지 확인
      this.current_move = [0, 0];     //--- 유저 1,2 현재 위치
      this.rotate_count = [0, 0];     //--- 유저 1,2 바퀴 수
      this.tax_bank = 0;    //--- 세금 창고
      this.current_turn = 0; //--- 현재 턴 유저 0,1
      this.trap_island = [0, 0]; //--- 무인도 유저 상황 0, 1
      this.trap_island_count = [4, 4]; //--- 무인도 3턴 카운트
      this.owenr_island_count = [0, 0];   //--- 섬 관광지 각각 몇개인지 
      this.owenr_ocean_count = [0, 0];   //--- 해변 관광지 각각 몇개인지 
      this.olympic_target_before = 0;  //--- 현재 올림픽 발생지
      this.olympic_target_after = 0;  //--- 현재 올림픽 발생지
      this.olympic_level = 2; //--- 올림픽 레벨
      this.travel_turn = 0;
      this.dice_double = document.querySelector(`.dice_double>p`);
      this.sell_time = 0;
      this.tax_key = 0;
    }
    create_map = () => {
      $(`.game_board>article>article>div`).sort(this.className).each((i, v)=>{
        this.check_list.push(Number(v.className.replace('pos_','')));
        let create_key = 0;
        for(let j=0; j<this.data_JSON.length; j++){
          if(v.className == ("pos_" + this.data_JSON[j].id)) {
            $(v).append(`<div style="background: ${this.data_JSON[j].color}"><p>${this.data_JSON[j].name}</p><article><div></div><div></div><div></div><div></div></article><article class="olympic_mark"><p>⨉2</p></article></div>`);
            this.land_list.push(new Place_module(this.data_JSON[j]));
            create_key = 1;
            break;
          }
        }
        if(create_key == 0) {
          if(v.className != "pos_0" && v.className != "pos_8" && v.className != "pos_24" && v.className != "pos_16") {
            if(v.className == "pos_30") {
              $(v).append(`<div style="background: #777"><p>국세청</p><p>지급</p><p>0</p></div>`);
              this.land_list.push("get_fee");
            } else {
              $(v).append(`<div style="background: #777"><p>국세청</p><p>납부</p></div>`);
              this.land_list.push("set_fee");
            }
          } else {
            switch(v.className){
              case "pos_0":
                this.land_list.push("start");
                break;
              case "pos_8":
                this.land_list.push("island");
                break;
              case "pos_24":
                this.land_list.push("travel");
                break;
                case "pos_16":
                this.land_list.push("olympic");
                break;
            }
          }
        }
        create_key = 0;
      })
      for(let i=0; i<this.check_list.length; i++){
        for(let j=0; j<this.check_list.length; j++){
          if(this.check_list[j] == i){
            this.last_list.push(this.land_list[j]);
          }
        }
      }
      for(let i=0; i<this.last_list.length; i++){
        this.owner_list.push(this.last_list[i].owner);
      }
    }
    move_obj = (_obj, _target, _time) => {
      $(`.copy_game_area`).empty();  //===== 카피 지도
      $(`.copy_game_area`).append($(`.game_board`).clone()); 
      $(`.copy_game_area`).append(`<article><div><p></p></div><div><p></p><div><p></p><div></div></div></div></article>`); 
      let stop_dice = 0;
      if((this.equal_dice[0]+this.equal_dice[1] > 0) && (this.equal_dice[0] == this.equal_dice[1])){
        [user_module_1, user_module_2][_target].state_island = 0   //--- 해당 유저 주사위 같을 시 무인도 유무 상관없이 무인도상태 0변경
        gsap.timeline().fromTo(this.dice_double, {y: '10vh', scale: 0}, {y: 0, scale: 1.3, duration: 0.3})
          .to(this.dice_double, {opacity: 0, duration: 1}, 0.2)
          .set(this.dice_double, {y: '10vh', scale: 0, opacity: 1, duration: 0.1});
      }
      this.trap_island_count[_target] = (this.trap_island_count[_target] == 0) ? (4) : (this.trap_island_count[_target]);
      if([user_module_1, user_module_2][_target].state_island == 0) {
        
        for(let i=0; i<this.move_gap[_target]; i++){
          setTimeout(()=>{
            this.rotate_count[_target] = Math.floor(this.move_count[_target]/32);
            this.current_move[_target] = (this.move_count[_target] - this.move_gap[_target] + i + 1) % 32;
            if(0 < this.current_move[_target] && this.current_move[_target] < 9){
              $(_obj).offset({
                top: `${$(`.pos_${this.current_move[_target]}`).offset().top - ($('body').height() * 0.0227)}`,
                left: `${$(`.pos_${this.current_move[_target]}`).offset().left + ($('body').height() * 0.0303)}`
              }, _time);
            } else if(8 < this.current_move[_target] && this.current_move[_target] < 17){
              $(_obj).offset({
                top: `${$(`.pos_${this.current_move[_target]}`).offset().top - ($('body').height() * 0.053)}`,
                left: `${$(`.pos_${this.current_move[_target]}`).offset().left + ($('body').height() * 0.0303)}`
              }, _time);
            } else if(16 < this.current_move[_target] && this.current_move[_target] < 25){
              $(_obj).offset({
                top: `${$(`.pos_${this.current_move[_target]}`).offset().top - ($('body').height() * 0.053)}`,
                left: `${$(`.pos_${this.current_move[_target]}`).offset().left + ($('body').height() * 0.0227)}`
              }, _time);
            } else {
              $(_obj).offset({
                top: `${$(`.pos_${this.current_move[_target]}`).offset().top - ($('body').height() * 0.0303)}`,
                left: `${$(`.pos_${this.current_move[_target]}`).offset().left + ($('body').height() * 0.0454)}`
              }, _time);
            }
          }, (i * _time));
          stop_dice = i * _time;
        }
      } else {
        this.move_count[_target] -= this.move_gap[_target];
      }
      //--- 주사위 턴 대기 구간 및 유저에 값 전달
      setTimeout(()=>{
        
        
        //--- 세계여행 부분 & 매각창
        if(this.current_move[0] == 24 || this.current_move[1] == 24 || this.sell_time == 1 ) {
          if(turn_count%2 == 1) {
            
            user_module_1.standing = this.current_move[0];    //--- 이동한 위치 저장
            if(this.sell_time == 0) {
              this.stand_check(user_module_1);
            }
          } else {
            
            user_module_2.standing = this.current_move[1];
            if(this.sell_time == 0) {
              this.stand_check(user_module_2);
            }
          }
        } else {
          move_dice_key = 0;
          $(`.btn_roll`).one('click', rollDice);    //--- 팝업창 클로즈 된 다음 호출로 이동 예정
          if(turn_count%2 == 1) {  
            
            user_module_1.standing = this.current_move[0];    //--- 이동한 위치 저장
            if(user_module_1.rotate_count < this.rotate_count[0]) {   //--- 1턴 이상 초과시 바퀴당 월급
              user_module_1.money += 300000;
            }
            user_module_1.rotate_count = this.rotate_count[0];
            if((program.equal_dice[0] + program.equal_dice[1]) > 0 && (program.equal_dice[0] == program.equal_dice[1])){
            } else {    // 주사위 같을경우 턴 변경 없이 진행
              this.current_turn = 1;    //--- 0번 유저(1)에서 1번 유저(2)로 변경
              turn_count++;
            }
            this.stand_check(user_module_1);
          } else {
            
            user_module_2.standing = this.current_move[1];
            if(user_module_2.rotate_count < this.rotate_count[1]) {
              user_module_2.money += 300000;
            }
            user_module_2.rotate_count = this.rotate_count[1];
            if((program.equal_dice[0] + program.equal_dice[1]) > 0 && (program.equal_dice[0] == program.equal_dice[1])){
            } else {
              this.current_turn = 0;
              turn_count++;
            }
            this.stand_check(user_module_2);
          }
        }
      }, (stop_dice + _time));
    }
    stand_check = (_module) => {
      switch(_module.standing) {
        //------------------- 출발지 ---------------------
        case 0:
          break;
        //------------------- 무인도 ---------------------
        case 8:
          this.trap_island[_module.code] = 1;
          this.trap_island_count[_module.code] -= 1;
          _module.state_island = 1;
          $(`.desert_island_popup>article`).empty();
          if(this.trap_island_count[_module.code] != 0) {
            $(`.desert_island_popup>article`).prepend(`
              <article>
                <div>
                  <p>${_module.id}님 🏝️ 무인도에 갇히셨습니다.</p>
                </div>
                <div>
                  <p>${this.trap_island_count[_module.code]} 차례 동안 이동을 할 수 없습니다.</p>
                </div>
              </article>
              <article>
                <div>
                  <p>20만원 지불</p>
                  <div></div>
                </div>
                <div>
                  <p>닫기</p>
                </div>
              </article>
            `);
          } else {
            $(`.desert_island_popup>article`).prepend(`<article><div><p>${_module.id}님 🏝️ 무인도에 갇히셨습니다.</p></div><div><p>다음 차례에 이동 할 수 있습니다.</p></div></article><article><span></span><div><p>닫기</p></div></article>`);
          }
          gsap.to($(`.desert_island_popup`)[0], {scale: 1});
          gsap.set($(`.desert_island_popup>article>article:nth-child(2)>div:nth-child(1)>div`), {scale: 0});
          if(_module.money < 200000) {
            gsap.to($(`.desert_island_popup>article>article:nth-child(2)>div:nth-child(1)>div`), {scale: 1});
          } else {
            $(`.desert_island_popup>article>article:nth-child(2)>div:nth-child(1)`).on('click', (e)=>{
              $(`.desert_island_popup>article>article:nth-child(2)>div`).off('click');
              gsap.to($(`.desert_island_popup`)[0], {scale: 0});
              if(_module.money < 200000) {
                //------------------------ 비용 부족 -----------------------------
              } else {
                _module.money -= 200000;
              }
              this.trap_island_count[_module.code] = 0;
              _module.state_island = 0;
            });
          }
          $(`.desert_island_popup>article>article:nth-child(2)>div:nth-child(2)`).on('click', (e)=>{
            $(`.desert_island_popup>article>article:nth-child(2)>div`).off('click');
            gsap.to($(`.desert_island_popup`)[0], {scale: 0});
            if(this.trap_island_count[_module.code] == 0){
              _module.state_island = 0;
            }
          });
          break;
        //------------------- 올림픽 ---------------------
        case 16:
          let check_my_area = 0;
          for(let i=0; i<this.last_list.length; i++){
            if(this.last_list[i].owner == _module.id && this.last_list[i].type == "city"){
              check_my_area++;
            }
          }
          if(check_my_area > 0) {
            gsap.to($(`.copy_game_area`), {transform: 'scale(1) rotateX(40deg) translateY(-10vh)'});
            this.click_position(_module, this.last_list[16]);
          } else {
            gsap.to($(`.error_popup`), {scale: 1});
            $(`.error_close`).on('click', ()=>{
              gsap.to($(`.error_popup`), {scale: 0});
              $(`.error_close`).off('click');
            })
          }
          break;
        //------------------- 세계여행 ---------------------
        case 24:
          gsap.to($(`.copy_game_area`), {transform: 'scale(1) rotateX(40deg) translateY(-10vh)'});
          this.travel_turn = 1;
          this.click_position(_module, this.last_list[24]);
          break;
        //------------------- 세금납부 ---------------------
        case 2:
        case 12:
        case 20:
        case 28:
          $(`.tax_popup>article`).find('article').remove();
          $(`.tax_popup>article`).prepend(`<article><div><p>세금이 납부 되었습니다.</p></div><div><p>- 20만원</p></div></article>`);
          if(_module.money < 200000) {
            //---------------------------- 돈 부족 시 발생 ----------------------------------------
            
            this.move_count[_module.code] += 0;
            this.move_gap[_module.code] = 0;
            this.sell_time = 1;
            this.tax_key = 1;
            if(_module.id == $(`.user_name_1`).html()){
              this.move_obj(user_obj_1, 0, 500);
            } else {
              this.move_obj(user_obj_2, 1, 500);
            }
            this.click_position(_module, this.last_list[_module.standing]);
          } else {
            gsap.set($(`.tax_popup>article>article>div:nth-child(2)>p`)[0], {color: '#F54'});
            gsap.to($(`.tax_popup`)[0], {scale: 1});
            _module.money -= 200000;
            this.tax_bank += 200000;
          }
          break;
        //------------------- 세금지급 ---------------------
        case 30:
          $(`.tax_popup>article`).find('article').remove();
          $(`.tax_popup>article`).prepend(`<article><div><p>보너스가 지급 되었습니다.</p></div><div><p>+ ${this.tax_bank/10000}만원</p></div></article>`);
          gsap.set($(`.tax_popup>article>article>div:nth-child(2)>p`)[0], {color: '#45F'});
          gsap.to($(`.tax_popup`)[0], {scale: 1});
          _module.money += this.tax_bank;
          this.tax_bank = 0;
          break;
        //------------------- 해변 관광지 ---------------------
        case 9:
        case 25:
          
          if(this.last_list[_module.standing].owner == "none"){  //--- 빈 땅 일때
            let island_class_list = [this.last_list[9], this.last_list[25]];
            let island_num_list = [9, 25]
            let island_type_img_r = ['island-flag-r', 'parasol-r', 'bungalow-r'];
            let island_type_img_b = ['island-flag-b', 'parasol-b', 'bungalow-b']; 
            $(`.island_popup_type>div`).each((i,v)=>{
              gsap.set(v, { background: '#333A' });
              (i == this.last_list[_module.standing].island_level) && (gsap.set(v, { background: '#910B' }));
            });
            $(`.island_popup_name`).html( this.last_list[_module.standing].name );
            gsap.set($(`.island_popup_color`)[0], { background: this.last_list[_module.standing].color });
            gsap.set($(`.island_popup_buy`)[0], { borderColor: this.last_list[_module.standing].color });
            gsap.set($(`.island_popup_buy p`), { color: this.last_list[_module.standing].color });
            if(_module.id == $(`.user_name_1`).html()){
              gsap.set($(`.island_popup_img`), {background: `url("../img/${island_type_img_r[this.last_list[_module.standing].island_level]}.png") no-repeat center center/contain`})
            } else {
              gsap.set($(`.island_popup_img`), {background: `url("../img/${island_type_img_b[this.last_list[_module.standing].island_level]}.png") no-repeat center center/contain`})
            }
            if(_module.money < 100000) {
              gsap.set($(`.island_popup_buy`), { pointerEvents: 'none'})
              gsap.set($(`.island_popup_buy>div:nth-child(4)`), { opacity: 1 })
            } else {
              gsap.set($(`.island_popup_buy`), { pointerEvents: 'all'})
              gsap.set($(`.island_popup_buy>div:nth-child(4)`), { opacity: 0 })
            }
            $(`.island_popup_total`).html( (this.last_list[_module.standing].build_cost/10000).toFixed(1).toLocaleString() + "만");
            $(`.island_popup_after`).html( ((_module.money - this.last_list[_module.standing].build_cost)/10000).toFixed(1).toLocaleString() + "만");
            $(`.island_popup_close`).on('click', ()=>{    //--- 닫기
              $(`.island_popup_close, .island_popup_buy`).off('click');
              gsap.to($(`.island_popup`), {scale: 0});
            });
            $(`.island_popup_buy`).on('click', ()=>{  //-- 클릭
              $(`.island_popup_close, .island_popup_buy`).off('click');
              _module.money -= 100000;
              this.last_list[_module.standing].owner = _module.id;
              if(_module.id == $(`.user_name_1`).html()){
                gsap.set($(`.pos_${_module.standing}>div>article>div`)[0], {background: `url("../img/${island_type_img_r[this.last_list[_module.standing].island_level]}.png") no-repeat center center/contain`});
              } else {
                gsap.set($(`.pos_${_module.standing}>div>article>div`)[0], {background: `url("../img/${island_type_img_b[this.last_list[_module.standing].island_level]}.png") no-repeat center center/contain`});  
              }
              this.last_list[_module.standing].island_level += 1;
              if((9 <= _module.standing && _module.standing <= 15) || (25 <= _module.standing && _module.standing <= 31)){
                gsap.to($(`.pos_${_module.standing}>div>article>div`)[0], {scale: 1.2, rotateY: '180deg', rotateX: '0deg', x: '0vh', y: '1vh'});
              } else {
                gsap.to($(`.pos_${_module.standing}>div>article>div`)[0], {scale: 1.2, rotateY: '0deg', rotateX: '0deg', x: '0vh', y: '1vh'});
              }
              this.last_list[_module.standing].set_level = [0,0,0,0];
              for(let j=0; j<this.last_list[_module.standing].island_level; j++){
                this.last_list[_module.standing].set_level[j] = 1;
              }
              gsap.to($(`.island_popup`), {scale: 0});
            });
            gsap.to($(`.island_popup`), {scale: 1});
          } else if(_module.id == this.last_list[_module.standing].owner) {     //-------------- 내 해변 방문
            let island_type_img_r = ['island-flag-r', 'parasol-r', 'bungalow-r'];
            let island_type_img_b = ['island-flag-b', 'parasol-b', 'bungalow-b']; 
            if(_module.id == $(`.user_name_1`).html()){
              gsap.set($(`.pos_${_module.standing}>div>article>div`)[0], {background: `url("../img/${island_type_img_r[this.last_list[_module.standing].island_level]}.png") no-repeat center center/contain`});
            } else {
              gsap.set($(`.pos_${_module.standing}>div>article>div`)[0], {background: `url("../img/${island_type_img_b[this.last_list[_module.standing].island_level]}.png") no-repeat center center/contain`});  
            }
            this.last_list[_module.standing].island_level = (this.last_list[_module.standing].island_level > 2) ? (2) : (this.last_list[_module.standing].island_level + 1);
            this.last_list[_module.standing].set_level = [0,0,0,0];
            for(let j=0; j<this.last_list[_module.standing].island_level; j++){
              this.last_list[_module.standing].set_level[j] = 1;
            }
          } else if(_module.id != this.last_list[_module.standing].owner) {      //---- 다른 소유자 땅 진입 시
            let island_type_img_r = ['island-flag-r', 'parasol-r', 'bungalow-r'];
            let island_type_img_b = ['island-flag-b', 'parasol-b', 'bungalow-b']; 
            let pass_cost_list = [0,
              this.last_list[_module.standing].pass_cost.land,
              this.last_list[_module.standing].pass_cost.parasol, 
              this.last_list[_module.standing].pass_cost.bungalow 
            ];
            if(_module.money < pass_cost_list[this.last_list[_module.standing].island_level]) {
              //--------------------- 돈 부족할 떄 -------------------------------------
              
              this.move_count[_module.code] += 0;
              this.move_gap[_module.code] = 0;
              this.sell_time = 1;
              this.tax_key = 1;
              if(_module.id == $(`.user_name_1`).html()){
                this.move_obj(user_obj_1, 0, 500);
              } else {
                this.move_obj(user_obj_2, 1, 500);
              }
              this.click_position(_module, this.last_list[_module.standing]);
            } else {
              _module.money -= pass_cost_list[this.last_list[_module.standing].island_level];
              if(_module.id == $(`.user_name_1`).html()){
                user_module_2.money += pass_cost_list[this.last_list[_module.standing].island_level];
              } else {
                user_module_1.money += pass_cost_list[this.last_list[_module.standing].island_level];
              }
            }
            if(_module.id == $(`.user_name_1`).html()){
              gsap.set($(`.pos_${_module.standing}>div>article>div`)[0], {background: `url("../img/${island_type_img_b[this.last_list[_module.standing].island_level]}.png") no-repeat center center/contain`});  
            } else {
              gsap.set($(`.pos_${_module.standing}>div>article>div`)[0], {background: `url("../img/${island_type_img_r[this.last_list[_module.standing].island_level]}.png") no-repeat center center/contain`});
            }
            this.last_list[_module.standing].island_level = (this.last_list[_module.standing].island_level > 2) ? (2) : (this.last_list[_module.standing].island_level + 1);
            this.last_list[_module.standing].set_level = [0,0,0,0];
            for(let j=0; j<this.last_list[_module.standing].island_level; j++){
              this.last_list[_module.standing].set_level[j] = 1;
            }
          }
          break;
        //------------------- 섬 관광지 ---------------------
        case 4:
        case 14:
        case 18:
          
          if(this.last_list[_module.standing].owner == "none"){  //--- 빈 땅 일때
            let island_class_list = [this.last_list[4], this.last_list[14], this.last_list[18]];
            let island_num_list = [4, 14, 18]
            let island_type_img_r = ['island-flag-r', 'parasol-r', 'bungalow-r'];
            let island_type_img_b = ['island-flag-b', 'parasol-b', 'bungalow-b']; 
            $(`.island_popup_name`).html( this.last_list[_module.standing].name );
            gsap.set($(`.island_popup_color`)[0], { background: this.last_list[_module.standing].color });
            gsap.set($(`.island_popup_buy`)[0], { borderColor: this.last_list[_module.standing].color });
            gsap.set($(`.island_popup_buy p`), { color: this.last_list[_module.standing].color });
            $(`.island_popup_type>div`).each((i,v)=>{
              gsap.set(v, { background: '#333A' });
              (i == this.owenr_island_count[_module.code]) && (gsap.set(v, { background: '#910B' }));
            });
            if(_module.id == $(`.user_name_1`).html()){
              gsap.set($(`.island_popup_img`), {background: `url("../img/${island_type_img_r[this.owenr_island_count[_module.code]]}.png") no-repeat center center/contain`})
            } else {
              gsap.set($(`.island_popup_img`), {background: `url("../img/${island_type_img_b[this.owenr_island_count[_module.code]]}.png") no-repeat center center/contain`})
            }
            if(_module.money < 100000) {
              gsap.set($(`.island_popup_buy`), { pointerEvents: 'none'})
              gsap.set($(`.island_popup_buy>div:nth-child(4)`), { opacity: 1 })
            } else {
              gsap.set($(`.island_popup_buy`), { pointerEvents: 'all'})
              gsap.set($(`.island_popup_buy>div:nth-child(4)`), { opacity: 0 })
            }
            $(`.island_popup_total`).html( (this.last_list[_module.standing].build_cost/10000).toFixed(1).toLocaleString() + "만");
            $(`.island_popup_after`).html( ((_module.money - this.last_list[_module.standing].build_cost)/10000).toFixed(1).toLocaleString() + "만");
            $(`.island_popup_close`).on('click', ()=>{    //--- 닫기
              $(`.island_popup_close, .island_popup_buy`).off('click');
              gsap.to($(`.island_popup`), {scale: 0});
            });
            $(`.island_popup_buy`).on('click', ()=>{  //-- 클릭
              $(`.island_popup_close, .island_popup_buy`).off('click');
              _module.money -= 100000;
              this.last_list[_module.standing].owner = _module.id;
              this.owenr_island_count[_module.code] += 1;
              for(let i=0; i<island_class_list.length; i++){
                if(island_class_list[i].owner == _module.id){
                  if(_module.id == $(`.user_name_1`).html()){
                    gsap.set($(`.pos_${island_num_list[i]}>div>article>div`)[0], {background: `url("../img/${island_type_img_r[this.owenr_island_count[_module.code]-1]}.png") no-repeat center center/contain`});
                  } else {
                    gsap.set($(`.pos_${island_num_list[i]}>div>article>div`)[0], {background: `url("../img/${island_type_img_b[this.owenr_island_count[_module.code]-1]}.png") no-repeat center center/contain`});  
                  }
                  island_class_list[i].island_level = this.owenr_island_count[_module.code];
                }
              }
              this.last_list[_module.standing].set_level = [0,0,0,0];
              for(let j=0; j<this.last_list[_module.standing].island_level; j++){
                this.last_list[_module.standing].set_level[j] = 1;
              }
              if((9 <= _module.standing && _module.standing <= 15) || (25 <= _module.standing && _module.standing <= 31)){
                gsap.to($(`.pos_${_module.standing}>div>article>div`)[0], {scale: 1.2, rotateY: '180deg', rotateX: '0deg', x: '0vh', y: '1vh'});
              } else {
                gsap.to($(`.pos_${_module.standing}>div>article>div`)[0], {scale: 1.2, rotateY: '0deg', rotateX: '0deg', x: '0vh', y: '1vh'});
              }
              gsap.to($(`.island_popup`), {scale: 0});
            });
            gsap.to($(`.island_popup`), {scale: 1});
          } else if(_module.id != this.last_list[_module.standing].owner) {      //---- 다른 소유자 땅 진입 시
            let pass_cost_list = [0,
              this.last_list[_module.standing].pass_cost.land,
              this.last_list[_module.standing].pass_cost.parasol, 
              this.last_list[_module.standing].pass_cost.bungalow 
            ];
            if(_module.money < pass_cost_list[this.last_list[_module.standing].island_level]) {
              //--------------------- 돈 부족할 떄 -------------------------------------
              
              this.move_count[_module.code] += 0;
              this.move_gap[_module.code] = 0;
              this.sell_time = 1;
              this.tax_key = 1;
              if(_module.id == $(`.user_name_1`).html()){
                this.move_obj(user_obj_1, 0, 500);
              } else {
                this.move_obj(user_obj_2, 1, 500);
              }
              this.click_position(_module, this.last_list[_module.standing]);
            } else {
              _module.money -= pass_cost_list[this.last_list[_module.standing].island_level];
              if(_module.id == $(`.user_name_1`).html()){
                user_module_2.money += pass_cost_list[this.last_list[_module.standing].island_level];
              } else {
                user_module_1.money += pass_cost_list[this.last_list[_module.standing].island_level];
              }
            }
          }
          break;
        //------------------- 일반 발판 ---------------------
        default: 
          
          
          
          if(this.last_list[_module.standing].owner == "none"){  //--- 빈 땅 일때
            
            gsap.set($(`.city_popup_color`)[0], { background: this.last_list[_module.standing].color });
            gsap.set($(`.city_popup_buy`)[0], { borderColor: this.last_list[_module.standing].color });
            gsap.set($(`.city_popup_buy p`), { color: this.last_list[_module.standing].color });
            gsap.set($(`.city_popup_buy`), { pointerEvents: 'all'})
            gsap.set($(`.city_popup_buy>div:nth-child(4)`), { opacity: 0 })
            if(_module.id == $(`.user_name_1`).html()) {
              gsap.to($(`.city_popup_list>div>div:nth-child(2)`)[0], {background: 'url("../img/flag-r.png") no-repeat center center/contain'});   
              gsap.to($(`.city_popup_list>div>div:nth-child(2)`)[1], {background: 'url("../img/villa-r.png") no-repeat center center/contain'});  
              gsap.to($(`.city_popup_list>div>div:nth-child(2)`)[2], {background: 'url("../img/building-r.png") no-repeat center center/contain'});    
              gsap.to($(`.city_popup_list>div>div:nth-child(2)`)[3], {background: 'url("../img/hotel-r.png") no-repeat center center/contain'});   
            } else {
              gsap.to($(`.city_popup_list>div>div:nth-child(2)`)[0], {background: 'url("../img/flag-b.png") no-repeat center center/contain'});   
              gsap.to($(`.city_popup_list>div>div:nth-child(2)`)[1], {background: 'url("../img/villa-b.png") no-repeat center center/contain'});  
              gsap.to($(`.city_popup_list>div>div:nth-child(2)`)[2], {background: 'url("../img/building-b.png") no-repeat center center/contain'});    
              gsap.to($(`.city_popup_list>div>div:nth-child(2)`)[3], {background: 'url("../img/hotel-b.png") no-repeat center center/contain'});   
            }
            let sum_city_buy = this.last_list[_module.standing].build_cost.land;
            let sum_city_pass = this.last_list[_module.standing].pass_cost.land;
            if(_module.money < sum_city_buy) {
              gsap.set($(`.city_popup_buy`), { pointerEvents: 'none'})
              gsap.set($(`.city_popup_buy>div:nth-child(4)`), { opacity: 1 })
            } else {
              gsap.set($(`.city_popup_buy`), { pointerEvents: 'all'})
              gsap.set($(`.city_popup_buy>div:nth-child(4)`), { opacity: 0 })
            }
            $(`.city_popup_name`).html( this.last_list[_module.standing].name );
            $(`.city_popup_list>div`).each((i,v)=>{
              $(`.city_popup_list>div`).removeClass('my_city_card');
              $(`.city_popup_list>div`).removeClass('active_city_card');
              $(`.city_popup_list>div:nth-child(1)`).addClass('active_city_card');
              $(v).on('click', ()=>{
                if(this.last_list[_module.standing].level[i] == 0 && i != 0){
                  this.last_list[_module.standing].level[i] = 1;
                  $(`.city_popup_list>div:nth-child(${i+1})`).addClass('active_city_card');
                } else if(this.last_list[_module.standing].level[i] == 1 && i != 0) {
                  $(`.city_popup_list>div:nth-child(${i+1})`).removeClass('active_city_card');
                  this.last_list[_module.standing].level[i] = 0;
                }
                for(let j=0; j<this.last_list[_module.standing].level.length; j++){
                  switch(j){
                    case 0:
                      sum_city_buy = this.last_list[_module.standing].build_cost.land;
                      sum_city_pass = this.last_list[_module.standing].pass_cost.land;
                      break;
                    case 1:
                      if(this.last_list[_module.standing].level[j] == 1){
                        sum_city_buy += this.last_list[_module.standing].build_cost.villa;
                        sum_city_pass += this.last_list[_module.standing].pass_cost.villa;
                      }
                      break;
                    case 2:
                      if(this.last_list[_module.standing].level[j] == 1){
                        sum_city_buy += this.last_list[_module.standing].build_cost.building;
                        sum_city_pass += this.last_list[_module.standing].pass_cost.building;
                      }
                      break;
                    case 3:
                      if(this.last_list[_module.standing].level[j] == 1){
                        sum_city_buy += this.last_list[_module.standing].build_cost.hotel;
                        sum_city_pass += this.last_list[_module.standing].pass_cost.hotel;
                      }
                      break;
                  }
                }
                $(`.city_popup_total`).html( (sum_city_buy/10000).toFixed(1).toLocaleString() + "만" );
                $(`.city_popup_pass`).html( (sum_city_pass/10000).toFixed(1).toLocaleString() + "만" );
                
                if(_module.money < sum_city_buy) {
                  gsap.set($(`.city_popup_buy`), { pointerEvents: 'none'})
                  gsap.set($(`.city_popup_buy>div:nth-child(4)`), { opacity: 1 })
                } else {
                  gsap.set($(`.city_popup_buy`), { pointerEvents: 'all'})
                  gsap.set($(`.city_popup_buy>div:nth-child(4)`), { opacity: 0 })
                }
              })
              $(`.popup_land_price`).html( (this.last_list[_module.standing].build_cost.land/10000).toFixed(1).toLocaleString() + "만");
              $(`.popup_villa_price`).html( (this.last_list[_module.standing].build_cost.villa/10000).toFixed(1).toLocaleString() + "만" );
              $(`.popup_building_price`).html( (this.last_list[_module.standing].build_cost.building/10000).toFixed(1).toLocaleString() + "만" );
              $(`.popup_hotel_price`).html( (this.last_list[_module.standing].build_cost.hotel/10000).toFixed(1).toLocaleString() + "만" );
            })
            $(`.city_popup_list>div:nth-child(1)`).addClass('active_city_card');
            $(`.city_popup_total`).html( (sum_city_buy/10000).toFixed(1).toLocaleString() + "만");
            $(`.city_popup_pass`).html( (sum_city_pass/10000).toFixed(1).toLocaleString() + "만");
            $(`.city_popup_close`).on('click', ()=>{      //---- 닫기 버튼 클릭
              $(`.city_popup_close, .city_popup_buy, .city_popup_list>div`).off('click');
              $(`.city_popup_list>div`).removeClass('active_city_card');
              $(`.city_popup_list>div:nth-child(1)`).addClass('active_city_card');
              gsap.to($(`.city_popup`)[0], {scale: 0});
            })
            $(`.city_popup_buy`).on('click', ()=>{        //---- 구매 버튼 클릭
              $(`.city_popup_close, .city_popup_buy, .city_popup_list>div`).off('click');
              $(`.city_popup_list>div`).removeClass('active_city_card');
              $(`.city_popup_list>div:nth-child(1)`).addClass('active_city_card');
              if(_module.id == $(`.user_name_1`).html()) {
                gsap.to($(`.pos_${_module.standing}>div>article>div`)[0], {background: 'url("../img/flag-r.png") no-repeat center center/contain'});   
                gsap.to($(`.pos_${_module.standing}>div>article>div`)[1], {background: 'url("../img/villa-r.png") no-repeat center center/contain'});  
                gsap.to($(`.pos_${_module.standing}>div>article>div`)[2], {background: 'url("../img/building-r.png") no-repeat center center/contain'});    
                gsap.to($(`.pos_${_module.standing}>div>article>div`)[3], {background: 'url("../img/hotel-r.png") no-repeat center center/contain'});   
              } else {
                gsap.to($(`.pos_${_module.standing}>div>article>div`)[0], {background: 'url("../img/flag-b.png") no-repeat center center/contain'});   
                gsap.to($(`.pos_${_module.standing}>div>article>div`)[1], {background: 'url("../img/villa-b.png") no-repeat center center/contain'});  
                gsap.to($(`.pos_${_module.standing}>div>article>div`)[2], {background: 'url("../img/building-b.png") no-repeat center center/contain'});    
                gsap.to($(`.pos_${_module.standing}>div>article>div`)[3], {background: 'url("../img/hotel-b.png") no-repeat center center/contain'});   
              }
              for(let i=0; i<4; i++){
                if(this.last_list[_module.standing].set_level[i] == 0 && this.last_list[_module.standing].level[i] == 1) {
                  if((9 <= _module.standing && _module.standing <= 15) || (25 <= _module.standing && _module.standing <= 31)){
                    gsap.to($(`.pos_${_module.standing}>div>article>div`)[i], {scale: 1, rotateX: '0deg', rotateY: '180deg'});    //----- 건물 세우기
                  } else {
                    gsap.to($(`.pos_${_module.standing}>div>article>div`)[i], {scale: 1, rotateX: '0deg'});    //----- 건물 세우기
                  }
                  if(i > 0) { //--- 빌라 이상일때 깃발 지우기
                    
                    gsap.to($(`.pos_${_module.standing}>div>article>div`)[0], {scale: 0});
                  }
                }
                this.last_list[_module.standing].set_level[i] = this.last_list[_module.standing].level[i]; //---- 레벨 변경 업데이트
              }
              this.last_list[_module.standing].owner = _module.id;
              _module.money -= sum_city_buy;
              gsap.to($(`.city_popup`)[0], {scale: 0});
            })
            gsap.to($(`.city_popup`)[0], {scale: 1});
          } else if(this.last_list[_module.standing].owner == _module.id) {   //---- 소유자랑 해당 유저가 같을 경우
            
            gsap.set($(`.city_popup_color`), { background: this.last_list[_module.standing].color });
            gsap.set($(`.city_pop_buy`), { borderColor: this.last_list[_module.standing].color });
            gsap.set($(`.city_pop_buy p`), { color: this.last_list[_module.standing].color });
            gsap.set($(`.city_popup_buy`), { pointerEvents: 'all'})
            gsap.set($(`.city_popup_buy>div:nth-child(4)`), { opacity: 0 })
            if(_module.id == $(`.user_name_1`).html()) {    //--- 팝업에 자기 색상 보이게
              gsap.to($(`.city_popup_list>div>div:nth-child(2)`)[0], {background: 'url("../img/flag-r.png") no-repeat center center/contain'});   
              gsap.to($(`.city_popup_list>div>div:nth-child(2)`)[1], {background: 'url("../img/villa-r.png") no-repeat center center/contain'});  
              gsap.to($(`.city_popup_list>div>div:nth-child(2)`)[2], {background: 'url("../img/building-r.png") no-repeat center center/contain'});    
              gsap.to($(`.city_popup_list>div>div:nth-child(2)`)[3], {background: 'url("../img/hotel-r.png") no-repeat center center/contain'});   
            } else {
              gsap.to($(`.city_popup_list>div>div:nth-child(2)`)[0], {background: 'url("../img/flag-b.png") no-repeat center center/contain'});   
              gsap.to($(`.city_popup_list>div>div:nth-child(2)`)[1], {background: 'url("../img/villa-b.png") no-repeat center center/contain'});  
              gsap.to($(`.city_popup_list>div>div:nth-child(2)`)[2], {background: 'url("../img/building-b.png") no-repeat center center/contain'});    
              gsap.to($(`.city_popup_list>div>div:nth-child(2)`)[3], {background: 'url("../img/hotel-b.png") no-repeat center center/contain'});   
            }
            let sum_city_buy = 0;
            let sum_city_pass = 0;
            let city_type_list = [
              this.last_list[_module.standing].pass_cost.land,
              this.last_list[_module.standing].pass_cost.villa,
              this.last_list[_module.standing].pass_cost.building,
              this.last_list[_module.standing].pass_cost.hotel
            ];
            for(let j=0; j<4; j++){
              if(this.last_list[_module.standing].set_level[j] == 1){
                sum_city_pass += city_type_list[j];
              }
            }
            $(`.city_popup_name`).html( this.last_list[_module.standing].name );
            $(`.city_popup_list>div`).each((i,v)=>{
              $(`.city_popup_list>div`).removeClass('active_city_card');
              $(`.city_popup_list>div`).removeClass('my_city_card');
              for(let j=0; j<4; j++){
                if(this.last_list[_module.standing].set_level[j] == 1){
                  $(`.city_popup_list>div:nth-child(${j+1})`).addClass('my_city_card');
                }
              }
              $(v).on('click', ()=>{
                if(this.last_list[_module.standing].level[i] == 0 && this.last_list[_module.standing].set_level[i] != 1){
                  this.last_list[_module.standing].level[i] = 1;
                  $(`.city_popup_list>div:nth-child(${i+1})`).addClass('active_city_card');
                } else if(this.last_list[_module.standing].level[i] == 1 && this.last_list[_module.standing].set_level[i] != 1) {
                  $(`.city_popup_list>div:nth-child(${i+1})`).removeClass('active_city_card');
                  this.last_list[_module.standing].level[i] = 0;
                }
                sum_city_buy = 0;
                sum_city_pass = 0;
                for(let j=0; j<4; j++){
                  if(this.last_list[_module.standing].set_level[j] == 1){
                    sum_city_pass += city_type_list[j];
                  }
                }
                for(let j=0; j<this.last_list[_module.standing].level.length; j++){
                  switch(j){
                    case 0:
                      if(this.last_list[_module.standing].level[j] == 1 && this.last_list[_module.standing].set_level[j] != 1){
                        sum_city_buy += this.last_list[_module.standing].build_cost.land;
                        sum_city_pass += this.last_list[_module.standing].pass_cost.land;
                      }
                      break;
                    case 1:
                      if(this.last_list[_module.standing].level[j] == 1 && this.last_list[_module.standing].set_level[j] != 1){
                        sum_city_buy += this.last_list[_module.standing].build_cost.villa;
                        sum_city_pass += this.last_list[_module.standing].pass_cost.villa;
                      }
                      break;
                    case 2:
                      if(this.last_list[_module.standing].level[j] == 1 && this.last_list[_module.standing].set_level[j] != 1){
                        sum_city_buy += this.last_list[_module.standing].build_cost.building;
                        sum_city_pass += this.last_list[_module.standing].pass_cost.building;
                      }
                      break;
                    case 3:
                      if(this.last_list[_module.standing].level[j] == 1 && this.last_list[_module.standing].set_level[j] != 1){
                        sum_city_buy += this.last_list[_module.standing].build_cost.hotel;
                        sum_city_pass += this.last_list[_module.standing].pass_cost.hotel;
                      }
                      break;
                  }
                }
                $(`.city_popup_total`).html( (sum_city_buy/10000).toFixed(1).toLocaleString() + "만" );
                $(`.city_popup_pass`).html( (sum_city_pass/10000).toFixed(1).toLocaleString() + "만" );
                
                if(_module.money < sum_city_buy) {
                  gsap.set($(`.city_popup_buy`), { pointerEvents: 'none'})
                  gsap.set($(`.city_popup_buy>div:nth-child(4)`), { opacity: 1 })
                } else {
                  gsap.set($(`.city_popup_buy`), { pointerEvents: 'all'})
                  gsap.set($(`.city_popup_buy>div:nth-child(4)`), { opacity: 0 })
                }
              })
              $(`.popup_land_price`).html( (this.last_list[_module.standing].build_cost.land/10000).toFixed(1).toLocaleString() + "만");
              $(`.popup_villa_price`).html( (this.last_list[_module.standing].build_cost.villa/10000).toFixed(1).toLocaleString() + "만" );
              $(`.popup_building_price`).html( (this.last_list[_module.standing].build_cost.building/10000).toFixed(1).toLocaleString() + "만" );
              $(`.popup_hotel_price`).html( (this.last_list[_module.standing].build_cost.hotel/10000).toFixed(1).toLocaleString() + "만" );
            })
            $(`.city_popup_list>div:nth-child(1)`).addClass('active_city_card');
            $(`.city_popup_total`).html( (sum_city_buy/10000).toFixed(1).toLocaleString() + "만");
            $(`.city_popup_pass`).html( (sum_city_pass/10000).toFixed(1).toLocaleString() + "만");
            $(`.city_popup_close`).on('click', ()=>{      //---- 닫기 버튼 클릭
              $(`.city_popup_close, .city_popup_buy, .city_popup_list>div`).off('click');
              $(`.city_popup_list>div`).removeClass('my_city_card');
              $(`.city_popup_list>div`).removeClass('active_city_card');
              $(`.city_popup_list>div:nth-child(1)`).addClass('active_city_card');
              gsap.to($(`.city_popup`)[0], {scale: 0});
            })
            $(`.city_popup_buy`).on('click', ()=>{        //---- 구매 버튼 클릭
              $(`.city_popup_close, .city_popup_buy, .city_popup_list>div`).off('click');
              $(`.city_popup_list>div`).removeClass('my_city_card');
              $(`.city_popup_list>div`).removeClass('active_city_card');
              $(`.city_popup_list>div:nth-child(1)`).addClass('active_city_card');
              for(let i=0; i<4; i++){
                if(this.last_list[_module.standing].set_level[i] == 0 && this.last_list[_module.standing].level[i] == 1) {
                  if((9 <= _module.standing && _module.standing <= 15) || (25 <= _module.standing && _module.standing <= 31)){
                    gsap.to($(`.pos_${_module.standing}>div>article>div`)[i], {scale: 1, rotateX: '0deg', rotateY: '180deg'});    //----- 건물 세우기
                  } else {
                    gsap.to($(`.pos_${_module.standing}>div>article>div`)[i], {scale: 1, rotateX: '0deg'});    //----- 건물 세우기
                  }
                  if(i > 0) { //--- 빌라 이상일때 깃발 지우기
                    gsap.to($(`.pos_${_module.standing}>div>article>div`)[0], {scale: 0});
                  }
                }
                this.last_list[_module.standing].set_level[i] = this.last_list[_module.standing].level[i];
              }
              this.last_list[_module.standing].owner = _module.id;
              _module.money -= sum_city_buy;
              gsap.to($(`.city_popup`)[0], {scale: 0});
            });
            gsap.to($(`.city_popup`)[0], {scale: 1});
          } else {      //---- 다른 소유자 땅 진입 시
            
            let index_pass = 0;
            let total_pass_price = 0;
            let total_take_price = 0;
            for(let v in this.last_list[_module.standing].pass_cost) {
              if(this.last_list[_module.standing].set_level[index_pass] == 1){
                total_pass_price += this.last_list[_module.standing].pass_cost[v];
                total_take_price += this.last_list[_module.standing].take_cost[v];
              }
              index_pass++;
            }
            //------------------- 올림픽 유무 확인 -------------------------
            if(this.olympic_target_after == _module.standing){
              total_pass_price *= this.olympic_level;
            }
            
            
            if(_module.money < total_pass_price) {
              //--------------------- 금액 부족 시 발생 부분 ---------------------------
              
              this.move_count[_module.code] += 0;
              this.move_gap[_module.code] = 0;
              this.sell_time = 1;
              if(_module.id == $(`.user_name_1`).html()){
                this.move_obj(user_obj_1, 0, 500);
              } else {
                this.move_obj(user_obj_2, 1, 500);
              }
              this.click_position(_module, this.last_list[_module.standing]);
            } else {
              _module.money -= total_pass_price;
              if(_module.money < total_take_price) {
                gsap.set($(`.take_popup_btn`), { pointerEvents: 'none'})
                gsap.set($(`.take_popup_btn>div:nth-child(4)`), { opacity: 1 })
              } else {
                gsap.set($(`.take_popup_btn`), { pointerEvents: 'all'})
                gsap.set($(`.take_popup_btn>div:nth-child(4)`), { opacity: 0 })
              }
              if(_module.id == $(`.user_name_1`).html()) {    //------ 땅 주인에게 통행료 넘기기
                user_module_2.money += total_pass_price;
              } else {
                user_module_1.money += total_pass_price;
              }
              $(`.take_city`).html(this.last_list[_module.standing].name);
              $(`.take_price`).html( (total_take_price/10000).toFixed(1).toLocaleString() + "만" );
              $(`.take_after_price`).html( ((_module.money - total_take_price)/10000).toFixed(1).toLocaleString() + "만" );
              $(`.take_popup_btn`).on('click',()=>{     //--------- 인수 확인
                $(`.take_popup_btn, .take_popup_close`).off('click');
                _module.money -= total_take_price;
                this.last_list[_module.standing].owner = _module.id;
                if(_module.id == $(`.user_name_1`).html()) {
                  gsap.set($(`.pos_${_module.standing}>div>article>div`)[0], {background: 'url("../img/flag-r.png") no-repeat center center/contain'});   
                  gsap.set($(`.pos_${_module.standing}>div>article>div`)[1], {background: 'url("../img/villa-r.png") no-repeat center center/contain'});  
                  gsap.set($(`.pos_${_module.standing}>div>article>div`)[2], {background: 'url("../img/building-r.png") no-repeat center center/contain'});    
                  gsap.set($(`.pos_${_module.standing}>div>article>div`)[3], {background: 'url("../img/hotel-r.png") no-repeat center center/contain'});   
                } else {
                  gsap.set($(`.pos_${_module.standing}>div>article>div`)[0], {background: 'url("../img/flag-b.png") no-repeat center center/contain'});   
                  gsap.set($(`.pos_${_module.standing}>div>article>div`)[1], {background: 'url("../img/villa-b.png") no-repeat center center/contain'});  
                  gsap.set($(`.pos_${_module.standing}>div>article>div`)[2], {background: 'url("../img/building-b.png") no-repeat center center/contain'});    
                  gsap.set($(`.pos_${_module.standing}>div>article>div`)[3], {background: 'url("../img/hotel-b.png") no-repeat center center/contain'});   
                }
                if(_module.id == $(`.user_name_1`).html()) {    //------ 땅 주인에게 인수금 넘기기
                  user_module_2.money += total_take_price;
                } else {
                  user_module_1.money += total_take_price;
                }
                gsap.to($(`.take_popup`)[0], {scale: 0});
              })
              $(`.take_popup_close`).on('click', ()=>{      //--------- 닫기 클릭
                $(`.take_popup_btn, .take_popup_close`).off('click');
                gsap.to($(`.take_popup`)[0], {scale: 0});
              })
              gsap.to($(`.take_popup`)[0], {scale: 1});
            }
          }
          break;
      }
    }
    click_position = (_move_module, _view_type) => {
      //--------- 카피 배열 정렬
      let copy_list_origin = [];
      let copy_list_sort = [];
      $(`.copy_game_area>section>article>article>div`).sort(this.className).each((i, v)=>{
        copy_list_sort.push((v.className).replace("pos_",""));
        copy_list_origin.push(v);
      });
      let last_copy_list = []
      for(let i=0; i<copy_list_sort.length; i++){
        for(let j=0; j<copy_list_sort.length; j++){
          if(Number(copy_list_sort[j]) == i){
            last_copy_list.push(copy_list_origin[j]);
          }
        }
      }
      if(_view_type == "olympic") {
        
        $(`.copy_game_area>article>div:nth-child(1)>p`).html('올림픽을 개최할 장소를 선택해주세요.');
        $(`.copy_game_area>article>div:nth-child(2)`).remove();
        last_copy_list.forEach((v,i,a)=>{
          gsap.set(v, { pointerEvents: 'none', filter: 'brightness(0%)' });
          if(this.last_list[i].type == "city" && this.last_list[i].owner == _move_module.id){
            gsap.set(v, { pointerEvents: 'all', filter: 'brightness(30%)' });
            $(v).on("click mouseenter mouseleave", (e)=>{
              if(e.type == "mouseenter") {
                gsap.set(v, { filter: 'brightness(100%)' });
              } else if(e.type == "mouseleave") {
                gsap.set(v, { filter: 'brightness(30%)' });
              } else {
                
                gsap.set($(`.olympic_mark`), {scale: 0});
                gsap.to($(`.pos_${i}>div>article:nth-child(3)`), {scale: 1});
                gsap.to($(`.copy_game_area`), {scale: 0});
                this.olympic_target_before = i;
                if(this.olympic_target_before == this.olympic_target_after && this.olympic_level < 5) {
                  this.olympic_level += 1;
                } else if(this.olympic_level != 5) {
                  this.olympic_level = 2;
                } else {
                  this.olympic_level = 2;
                }
                $(`.pos_${i}>div>article:nth-child(3)>p`).html(`⨉${this.olympic_level}`);
                this.olympic_target_after = this.olympic_target_before;
                $(`.copy_game_area>section>article>article>div`).off('click mouseenter mouseleave');
              }
            });
          }
        })
      } else if(_view_type == "travel") {
        
        $(`.copy_game_area>article>div:nth-child(1)>p`).html('세계여행으로 이동할 장소를 선택해주세요.');
        $(`.copy_game_area>article>div:nth-child(2)`).remove();
        last_copy_list.forEach((v,i,a)=>{
          gsap.set(v, { pointerEvents: 'none', filter: 'brightness(0%)' });
          if(i != 24){
            gsap.set(v, { pointerEvents: 'all', filter: 'brightness(30%)' });
            $(v).on("click mouseenter mouseleave", (e)=>{
              if(e.type == "mouseenter") {
                gsap.set(v, { filter: 'brightness(100%)' });
              } else if(e.type == "mouseleave") {
                gsap.set(v, { filter: 'brightness(30%)' });
              } else {
                
                gsap.to($(`.copy_game_area`), {scale: 0, duration: 0.3});
                if(i > 24) {
                  this.move_count[_move_module.code] += (i - 24);
                  this.move_gap[_move_module.code] = (i - 24);
                } else {
                  this.move_count[_move_module.code] += (i + 8);
                  this.move_gap[_move_module.code] = (i + 8);
                }
                if(_move_module.id == $(`.user_name_1`).html()){
                  this.travel_turn = 0;
                  this.move_obj(user_obj_1, 0, 300);
                } else {
                  this.travel_turn = 0;
                  this.move_obj(user_obj_2, 1, 300);
                }
                $(`.copy_game_area>section>article>article>div`).off('click mouseenter mouseleave');
              }
            });
          }
        })
      } else {
        
        let index_pass = 0;
        let total_pass_price = 0;
        for(let v in this.last_list[_move_module.standing].pass_cost) {
          if(this.last_list[_move_module.standing].set_level[index_pass] == 1){
            total_pass_price += this.last_list[_move_module.standing].pass_cost[v];
          }
          index_pass++;
        }
        if(this.tax_key == 1) {
          total_pass_price += 200000;
        }
        
        let sell_choice_price = 0;
        sell_choice_price = _move_module.money;
        for(let k=0; k<this.last_list.length; k++){
          if(this.last_list[k].owner == _move_module.id){
            for(let g=0; g<this.last_list[k].set_level.length; g++){
              if(this.last_list[k].set_level[g] == 1){
                switch(g) {
                  case 0:
                    if(this.last_list[k].type == "city"){
                      sell_choice_price += this.last_list[k].sell_cost.land;
                    } else {
                      sell_choice_price += 50000;
                    }
                    break;
                  case 1:
                    if(this.last_list[k].type == "city"){
                      sell_choice_price += this.last_list[k].sell_cost.villa;
                    } else {
                      sell_choice_price += 50000;
                    }
                    break;
                  case 2:
                    if(this.last_list[k].type == "city"){
                      sell_choice_price += this.last_list[k].sell_cost.building;
                    } else {
                      sell_choice_price += 50000;
                    }
                    break;
                  case 3:
                    sell_choice_price += this.last_list[k].sell_cost.hotel;
                    break;
                }
              }
            }
          }
        }
        if(total_pass_price > sell_choice_price){   //--------- 게임 종료
          gsap.to($(`.end_popup`), {transform: 'scale(1)'});
          if(_move_module.id == $(`.user_name_1`).html()){
            $(`.end_user`).html(`${$(`.user_name_2`).html()} 승리!`);
            $(`#win_name`).val($(`.user_name_2`).html());
            $(`#loss_name`).val($(`.user_name_1`).html());
          } else {
            $(`.end_user`).html(`${$(`.user_name_1`).html()} 승리!`);
            $(`#win_name`).val($(`.user_name_1`).html());
            $(`#loss_name`).val($(`.user_name_2`).html());
          }
          $(`.end_popup_close`).on('click', ()=>{
            $(`#hidden_btn`).click();
          })
        } else {
          gsap.to($(`.copy_game_area`), {transform: 'scale(1) rotateX(40deg) translateY(-10vh)'});
          $(`.copy_game_area>article>div:nth-child(1)>p`).html('자산이 부족하여 매각할 장소를 선택해주세요.');
          $(`.copy_game_area>article>div:nth-child(2)>p`).html(`-` + ((total_pass_price - _move_module.money)/10000).toFixed(1).toLocaleString() + '만'); //-- 부족금액 표시
          $(`.copy_game_area>article>div:nth-child(2)>div>p`).html('매각하기'); //-- 매각버튼 텍스트
          gsap.to($(`.copy_game_area>article>div:nth-child(2)>div>div`), {scale: 1});
          last_copy_list.forEach((v,i,a)=>{
            gsap.set(v, { pointerEvents: 'none', filter: 'brightness(0%)' });
            if(this.last_list[i].owner == _move_module.id){
              gsap.set(v, { pointerEvents: 'all', filter: 'brightness(30%)' });
              $(v).on("click mouseenter mouseleave", (e)=>{
                if(e.type == "mouseenter") {
                  gsap.set(v, { filter: 'brightness(100%)' });
                } else if(e.type == "mouseleave") {
                  if(this.last_list[i].sell_check != 1){
                    gsap.set(v, { filter: 'brightness(30%)' });
                  }
                } else {
                  if(this.last_list[i].sell_check == 0){
                    this.last_list[i].sell_check = 1;
                    gsap.set(v, { filter: 'brightness(100%)' });
                  } else {
                    this.last_list[i].sell_check = 0;
                    gsap.set(v, { filter: 'brightness(30%)' });
                  }
                  sell_choice_price = _move_module.money;
                  for(let k=0; k<this.last_list.length; k++){
                    if(this.last_list[k].sell_check == 1){
                      for(let g=0; g<this.last_list[k].set_level.length; g++){
                        if(this.last_list[k].set_level[g] == 1){
                          switch(g) {
                            case 0:
                              if(this.last_list[k].type == "city"){
                                sell_choice_price += this.last_list[k].sell_cost.land;
                              } else {
                                sell_choice_price += 50000;
                              }
                              break;
                            case 1:
                              if(this.last_list[k].type == "city"){
                                sell_choice_price += this.last_list[k].sell_cost.villa;
                              } else {
                                sell_choice_price += 50000;
                              }
                              break;
                            case 2:
                              if(this.last_list[k].type == "city"){
                                sell_choice_price += this.last_list[k].sell_cost.building;
                              } else {
                                sell_choice_price += 50000;
                              }
                              break;
                            case 3:
                              sell_choice_price += this.last_list[k].sell_cost.hotel;
                              break;
                          }
                        }
                      }
                    }
                  }
                  $(`.copy_game_area>article>div:nth-child(2)>div`).off('click');
                  
                  
                  
                  
                  if((total_pass_price - sell_choice_price) <= 0) { //--- 선택 매각금액 오케이
                    $(`.copy_game_area>article>div:nth-child(2)>p`).html(((sell_choice_price-total_pass_price)/10000).toFixed(1).toLocaleString() + '만'); //-- 부족금액 표시
                    gsap.to($(`.copy_game_area>article>div:nth-child(2)>div>div`), {scale: 0});
                    $(`.copy_game_area>article>div:nth-child(2)>div`).on('click', ()=>{
                      for(let i=0; i<this.last_list.length; i++){
                        if(this.last_list[i].sell_check == 1){
                          this.last_list[i].sell_land();
                        }
                      }
                      _move_module.money += (sell_choice_price - _move_module.money);
                      _move_module.money -= total_pass_price;
                      this.sell_time = 0;
                      gsap.to($(`.copy_game_area`), {scale: 0, duration: 0.3});
                      if(this.tax_key == 1){
                        gsap.set($(`.tax_popup>article>article>div:nth-child(2)>p`)[0], {color: '#F54'});
                        gsap.to($(`.tax_popup`)[0], {scale: 1});
                        this.tax_key = 0;
                        this.tax_bank += 200000;
                      } else {
                        if(_move_module.id == $(`.user_name_1`).html()){
                          user_module_2.money += total_pass_price;
                        } else {
                          user_module_1.money += total_pass_price;
                        }
                      }
                      $(`.copy_game_area>section>article>article>div`).off('click mouseenter mouseleave');
                    })
                  } else {
                    $(`.copy_game_area>article>div:nth-child(2)>p`).html(((sell_choice_price-total_pass_price)/10000).toFixed(1).toLocaleString() + '만'); //-- 부족금액 표시
                    gsap.to($(`.copy_game_area>article>div:nth-child(2)>div>div`), {scale: 1});
                  }
                }
              });
            }
          })
        }

      }
    }
    monitoring_game = () => {
      $(`.pos_30>div>p:nth-child(3)`).html( this.tax_bank/10000 );
      let count_island = [0,0];
      if(this.last_list[4].owner == $(`#login_1`).val()){
        count_island[0] += 1;  
      }
      if(this.last_list[14].owner == $(`#login_1`).val()){
        count_island[0] += 1;  
      }
      if(this.last_list[18].owner == $(`#login_1`).val()){
        count_island[0] += 1;  
      }
      if(this.last_list[4].owner == $(`#login_2`).val()){
        count_island[1] += 1;  
      }
      if(this.last_list[14].owner == $(`#login_2`).val()){
        count_island[1] += 1;  
      }
      if(this.last_list[18].owner == $(`#login_2`).val()){
        count_island[1] += 1;  
      }
      this.owenr_island_count[0] = count_island[0];
      this.owenr_island_count[1] = count_island[1];
      switch(this.current_turn){    //--- 현재 턴 유저 이미지 강조
        case 0:
          gsap.to($(`.user_img_2`)[0], {scale: 1});
          gsap.to($(`.user_img_1`)[0], {scale: 1.7});
          $(`.side`).css('background-color', '#F54');
          break;
        case 1:
          gsap.to($(`.user_img_1`)[0], {scale: 1});
          gsap.to($(`.user_img_2`)[0], {scale: 1.7});
          $(`.side`).css('background-color', '#45F');
          break;
      }
      for(let i=0; i<this.last_list.length; i++){
        this.owner_list[i] = this.last_list[i].owner;
      }
      if(user_module_1.state_travel == 1){
        gsap.set($(`.user_obj_1`), {transition: 'all 0.3s'});
      } else {
        gsap.set($(`.user_obj_1`), {transition: 'all 0.5s'});
      }
      if(user_module_2.state_travel == 1){
        gsap.set($(`.user_obj_2`), {transition: 'all 0.3s'});
      } else {
        gsap.set($(`.user_obj_2`), {transition: 'all 0.5s'});
      }
      //----------------- user 1 ------------------//
      $(`.user_money_1`)[0].innerHTML = (user_module_1.money / 10000).toFixed(1).toLocaleString() + " 만";
      //----------------- user 2 ------------------//
      $(`.user_money_2`)[0].innerHTML = (user_module_2.money / 10000).toFixed(1).toLocaleString() + " 만";
      requestAnimationFrame(this.monitoring_game);
    }
  }
  const program = new Program_module(marble_data);
  program.create_map();


  let start_check = 0;
  let choice_user = [0,0,0,0,0];
  let obj_img_list = ["../img/obj1.png", "../img/obj2.png", "../img/obj3.png", "../img/obj4.png", "../img/obj5.png"];
  gsap.set($(`#login_1, #login_2`), {scale: 0});
  $(`.btn_login_1`).on("click", ()=>{
    gsap.to($(`.login_btn`), {borderColor: '#F00'});
    gsap.to($(`.login_btn>p`), {color: '#F00'});
    let my_pick_num = 5;
    let cross_img = 5;
    gsap.to($(`.login_popup`), {scale: 1});
    gsap.set($(`#login_1`), {scale: 1});
    gsap.set($(`.choice_img>div`), {scale: 1});
    $(`.choice_img`).each((i,v)=>{
      $(v).on('click',()=>{
        gsap.set($(`.choice_img`), {borderColor: '#FFF'});
        gsap.to($(`.choice_img>div`), {scale: 1});
        gsap.set(v, {borderColor: '#FF3'});
        gsap.to($(v).find('div'), {scale: 1.4})
        choice_user = [0,0,0,0,0];
        choice_user[i] = 1;
        my_pick_num = i;
        if(cross_img != 5){
          gsap.set($(`.choice_img`)[cross_img], {borderColor: '#F00', scale: 1});
        }
      })
      if(choice_user[i] != 0){
        $(v).off('click');
        cross_img = i;
        gsap.set(v, {borderColor: '#F00', scale: 1});
      }
      if(choice_user[i] == 0 && my_pick_num == 5){
        my_pick_num = i;
        choice_user[i] = 2;
        gsap.set(v, {borderColor: '#FF3'});
        gsap.to($(v).find('div'), {scale: 1.4})
      }
    })
    $(`#login_1`).on('keyup',()=>{
      if($(`#login_1`).val().length > 0 && $(`#login_2`).val() != $(`#login_1`).val()){
        gsap.to($(`.login_btn >p`), {color: '#FFF'});
        gsap.to($(`.login_btn`), {borderColor: '#FFF'});
        $(`.login_btn`).off('click');
        $(`.login_btn`).on('click', ()=>{
          $(`.user_name_1`).html($(`#login_1`).val());
          gsap.set($(`.user_img_1, .user_obj_1`), { background: `url(${obj_img_list[my_pick_num]}) no-repeat center center/contain` });
          user_module_1 = new User_module($(`#login_1`).val(), 0);
          $(`.btn_login_1, .login_btn, .choice_img`).off('click');
          gsap.to($(`.btn_login_1`), {scale: 0});
          gsap.to($(`.login_popup`), {scale: 0});
          gsap.set($(`#login_1`), {scale: 0});
          start_check++;
          $(`.user_money_1`)[0].innerHTML = (user_module_1.money / 10000).toFixed(1).toLocaleString() + " 만";
          if(start_check == 2){
            program.monitoring_game();
            gsap.to($(`.game_title`), {transform: 'scale(1) rotateX(-5deg)'});
            gsap.to($(`.btn_roll`), {scale: 1});
            gsap.to($(`.dice_container`), {scale: 0.5});
            gsap.to($(`.please_login`), {scale: 0});
            $(`.btn_roll`).one('click', rollDice);
          }
        })
      } else {
        gsap.to($(`.login_btn`), {borderColor: '#F00'});
        gsap.to($(`.login_btn>p`), {color: '#F00'});
      }
    })
  })
  $(`.btn_login_2`).on("click", ()=>{
    gsap.to($(`.login_btn`), {borderColor: '#F00'});
    gsap.to($(`.login_btn>p`), {color: '#F00'});
    let my_pick_num = 5;
    let cross_img = 5;
    gsap.to($(`.login_popup`), {scale: 1});
    gsap.set($(`#login_2`), {scale: 1});
    gsap.set($(`.choice_img>div`), {scale: 1});
    $(`.choice_img`).each((i,v)=>{
      $(v).on('click',()=>{
        gsap.set($(`.choice_img`), {borderColor: '#FFF'});
        gsap.to($(`.choice_img>div`), {scale: 1});
        gsap.set(v, {borderColor: '#FF3'});
        gsap.to($(v).find('div'), {scale: 1.4})
        choice_user = [0,0,0,0,0];
        choice_user[i] = 2;
        my_pick_num = i;
        if(cross_img != 5){
          gsap.set($(`.choice_img`)[cross_img], {borderColor: '#F00', scale: 1});
        }
      })
      if(choice_user[i] != 0){
        $(v).off('click');
        cross_img = i;
        gsap.set(v, {borderColor: '#F00', scale: 1});
      }
      if(choice_user[i] == 0 && my_pick_num == 5){
        my_pick_num = i;
        choice_user[i] = 2;
        gsap.set(v, {borderColor: '#FF3'});
        gsap.to($(v).find('div'), {scale: 1.4})
      }
    })
    $(`#login_2`).on('keyup',()=>{
      if($(`#login_2`).val().length > 0 && $(`#login_2`).val() != $(`#login_1`).val()){
        gsap.to($(`.login_btn >p`), {color: '#FFF'});
        gsap.to($(`.login_btn`), {borderColor: '#FFF'});
        $(`.login_btn`).off('click');
        $(`.login_btn`).on('click', ()=>{
          $(`.user_name_2`).html($(`#login_2`).val());
          gsap.set($(`.user_img_2, .user_obj_2`), { background: `url(${obj_img_list[my_pick_num]}) no-repeat center center/contain` });
          user_module_2 = new User_module($(`#login_2`).val(), 1);
          $(`.btn_login_2, .login_btn, .choice_img`).off('click');
          gsap.to($(`.btn_login_2`), {scale: 0});
          gsap.to($(`.login_popup`), {scale: 0});
          gsap.set($(`#login_2`), {scale: 0});
          start_check++;
          $(`.user_money_2`)[0].innerHTML = (user_module_1.money / 10000).toFixed(1).toLocaleString() + " 만";
          if(start_check == 2){
            program.monitoring_game();
            gsap.to($(`.game_title`), {transform: 'scale(1) rotateX(-5deg)'});
            gsap.to($(`.btn_roll`), {scale: 1});
            gsap.to($(`.dice_container`), {scale: 0.5});
            gsap.to($(`.please_login`), {scale: 0});
            $(`.btn_roll`).one('click', rollDice);
          }
        })
      } else {
        gsap.to($(`.login_btn`), {borderColor: '#F00'});
        gsap.to($(`.login_btn>p`), {color: '#F00'});
      }
    })
  })


  $(`.rank_list>article:nth-child(2)`).append('<div></div>');
  $(`.rank_list>article:nth-child(3)`).append('<div></div>');
  $(`.rank_list>article:nth-child(4)`).append('<div></div>');
  

  $(`.close_popup`).on('click', function(e){
    gsap.to($(`.tax_popup`)[0], {scale: 0});
  });

  //--- 초기 위치
  $(`.user_obj_1`).offset({
    top: `${$(`.pos_0`).offset().top + ($(`.pos_0`).height()*0)}`,
    left: `${$(`.pos_0`).offset().left + ($(`.pos_0`).width()*0.2)}`
  });
  $(`.user_obj_2`).offset({
    top: `${$(`.pos_0`).offset().top + ($(`.pos_0`).height()*0.1)}`,
    left: `${$(`.pos_0`).offset().left + ($(`.pos_0`).width()*0.75)}`
  });
  const user_obj_1 = document.querySelector(`.user_obj_1`);
  const user_obj_2 = document.querySelector(`.user_obj_2`);
  let turn_count = 1;


  //--- 주사위


  let dice_key = 0;
  let rollTimeout;
  let move_dice_key = 0;
  
  function setVal(num, val) {
    let dices = document.querySelectorAll('.dice');
    let dice = dices.item(num - 1);
    if (!dice) return;
    dice.setAttribute('data-val', val);
    dice_key++;
  }
  
  function toggleRoll() {
    setVal(1, 0);
    setVal(2, 0);
  }

  function getRand() {
    return Math.round(Math.random() * 5 + 1);
  }
  
  let trap_pass_key = 0;
  function setVals() {
    let get_rand_1 = getRand();
    let get_rand_2 = getRand();
    setVal(1, get_rand_1);
    setVal(2, get_rand_2);
    if(move_dice_key == 0){
      move_dice_key = 1;
      program.equal_dice[0] = get_rand_1;
      program.equal_dice[1] = get_rand_2;
      if((program.equal_dice[0] + program.equal_dice[1]) > 0 && (program.equal_dice[0] == program.equal_dice[1])){
        trap_pass_key = 1;
      }
      if(turn_count%2 == 1) {
        
        program.move_count[0] += (get_rand_1 + get_rand_2);
        program.move_gap[0] = (get_rand_1 + get_rand_2);
        if(trap_pass_key == 1){
          program.trap_island_count[0] = 0;
          trap_pass_key = 0;
        }
        setTimeout(()=>{
          program.move_obj(user_obj_1, 0, 500);
        }, 500);
      } else {
        
        program.move_count[1] += (get_rand_1 + get_rand_2);
        program.move_gap[1] = (get_rand_1 + get_rand_2);
        if(trap_pass_key == 1){
          program.trap_island_count[1] = 0;
          trap_pass_key = 0;
        }
        setTimeout(()=>{
          program.move_obj(user_obj_2, 1, 500);
        }, 500);
      }
    }
  }

  function rollDice() {
    if (rollTimeout) clearTimeout(rollTimeout);
    toggleRoll();
    rollTimeout = setTimeout(function() {
      setVals();
    }, 1000);
  }



})