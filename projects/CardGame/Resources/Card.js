// Card.js

var Animal = cc.Class.extend({
	_layer: null,
	_card: null,
	_center: null,
	_animal: null,

	_animate: null,
	_damageLabel: null,
	_damageLabelAction: null,
	
	init:function(node){
		this._card = node;

		var an = cc.Sprite.create(IMG.animal[this._card.getInfo().ID]);			
		var cs = an.getContentSize();
		this._center = cc.p(cs.width / 2, cs.height / 2);
		this._layer = cc.LayerColor.create(cc.c4b(0, 0, 125, 0), cs.width, cs.height);
		this._layer.setPosition(cc.p(-cs.width / 2, -cs.height / 2 + 50));
		this._layer.setAnchorPoint(cc.p(0.5, 0));
		this._layer.addChild(an);
		an.setPosition(this._center);

		this._animal = an;
	},
	getNode:function(){
		return this._layer;
	},
	attack:function(effect){
		if (effect){
			if (effect > 0){
				var ac = cc.ScaleBy.create(0.3, 1.3);
				this._layer.runAction(cc.Sequence.create(ac, ac.reverse()));
			}
			if (effect == 1){
				var effectAtk = cc.Layer.create();
				effectAtk.setPosition(cc.pSub(cc.p(0, 0), VisibleRect.center()));
				this._layer.getParent().getParent().addChild(effectAtk);

				var etk2 = cc.Sprite.create(IMG.attackEffect["1_2"]);
				// etk2.setPosition(cc.pAdd(VisibleRect.center(), cc.p(0, 80)));
				etk2.setPosition(cc.pAdd(VisibleRect.center(), cc.p(250, 700)));
				var actionEtk2 = cc.MoveTo.create(0.3, cc.pAdd(VisibleRect.center(), cc.p(0, 80)));
				var actionEtk2_2 = cc.MoveTo.create(0.5, cc.pAdd(VisibleRect.center(), cc.p(250, 700)));
				var actionE2 = cc.Sequence.create(
					cc.DelayTime.create(0.6),
					actionEtk2, cc.CallFunc.create(function(){

					var etk1l = cc.Sprite.create(IMG.attackEffect["1_1"]);
					etk1l.setPosition(cc.pAdd(VisibleRect.center(), cc.p(-340, -135)));

					var etk1r = cc.Sprite.create(IMG.attackEffect["1_1"]);
					etk1r.setFlipX(true);
					etk1r.setPosition(cc.pAdd(VisibleRect.center(), cc.p(325, -125)));

					var fadeOut = cc.FadeOut.create(0.1);
					etk1l.runAction(fadeOut);
					etk1r.runAction(fadeOut.copy());

					effectAtk.addChild(etk1l);
					effectAtk.addChild(etk1r);				
					
				}), actionEtk2_2, cc.CallFunc.create(function(){
					this.removeFromParent();
				}, effectAtk));
				etk2.runAction(actionE2);
				effectAtk.addChild(etk2);
			} else if (effect  == 2){
				var effectAtk2 = cc.Layer.create();
				effectAtk2.setPosition(cc.pSub(cc.p(0, 0), VisibleRect.center()));
				this._layer.getParent().getParent().addChild(effectAtk2);

				// var sprite = cc.Sprite.create(IMG.attackEffect["2_1"]);
				var sprite = cc.Sprite.create();
				sprite.setPosition(VisibleRect.center());
				effectAtk2.addChild(sprite);

				var ea2 = cc.Animation.create();
				for(var i = 1; i < 7; i++){
					var frameName = "attack_effect_2_" + i + ".png";
					ea2.addSpriteFrameWithFile(frameName);
				}
				ea2.setDelayPerUnit(0.08);

				sprite.runAction(cc.Sequence.create(
					cc.DelayTime.create(0.6),
					cc.Animate.create(ea2),
					cc.FadeOut.create(0.3)));
				effectAtk2.runAction(cc.Sequence.create(
					cc.DelayTime.create(0.6),					
					cc.DelayTime.create(1.0),
					cc.CallFunc.create(function(){
						this.removeFromParent();
					}, effectAtk2)
				));
			
			}
			return;
		}
		if (!this._animate){
			this._animate = cc.Sprite.create(IMG.attack[0]);
			if (this._card.isMonster())
				this._animate.setFlipX(true);
			this._animate.setPosition(cc.pAdd(this._center, cc.p(30, 0)));
			this._layer.addChild(this._animate);
			this._animate.runAction(Utile.getAnimate(0.08, IMG.attack, this.unAnimate, this));
			// this._animate.runAction(Utile.getAnimate(0.1, IMG.attack));
		}else{
			this.unAnimate();
			this.attack();
		}
	},
	hurt:function(damage, effect){
		if (!this._animate){
			this._animate = cc.Sprite.create(IMG.hurt[0]);
			this._animate.setPosition(cc.pAdd(this._center, cc.p(0, 0)));
			this._layer.addChild(this._animate);
			if (!effect){
				this._animate.runAction(
					Utile.getAnimate(0.10, IMG.hurt, this.unAnimate, this)
				);				
			}else{
				this._animate.runAction(
					Utile.getAnimate(0.10, IMG.hurt, function(){
						this._animate.setFlipX(true);
						this._animate.runAction(Utile.getAnimate(0.10, IMG.hurt, this.unAnimate, this));
					}, this)
				);			
			}
			// damage label
			if (!this._damageLabel){
				var label = cc.LabelTTF.create("-" + damage, "", 60);
				label.setColor(cc.RED);
				this._layer.addChild(label);
				this._damageLabel = label;
			}
			this._damageLabel.setString("-" + damage);
			this._damageLabel.setPosition(cc.pAdd(this._center, cc.p(0, 80)));

			var fadeIn = cc.FadeIn.create(0.3);
			var fadeOut = cc.FadeOut.create(1.5);
			var mu = cc.MoveBy.create(1, cc.p(0, 60));
			var action = cc.Spawn.create(fadeIn, fadeOut, mu);				
			
			this._damageLabel.runAction(action);
		}else{
			this.unAnimate();
			this.hurt(damage);
		}
	},
	unAnimate:function(){
		if (this._animate){
			this._animate.removeFromParent();
			this._animate = null;
		}
	},
	die:function(){
		var t1 = cc.TintTo.create(0.5, 200, 0, 0);
		var t2 = cc.TintTo.create(1, 100, 100, 100);
		var action = cc.Sequence.create(t1, t2);
		this._animal.runAction(action);

	}
});

var Card = cc.Node.extend({
	
	_hp: null,
	_atk: null,
	_level: null,
	_name: null,
	_damage: 0,
	
	_skillA: null,
	_skillB: null,
	_sAnimal: null,

	_node: null,
	_info: null,
	_isMonster: true,

	_nHp: null,

	init:function(info){
		if (this._super()){
			
			if (info){
				this._info = info;
				this._isMonster = info.Type == C.MONSTER;
			} else{
				// if info is null, default test value
				this._info = {
					"Level": 20,
					"HP": 20,
					"Name": "Dog",
					"ID": "001",
					"Attack": 25,
					"Skill":[1, 2]
				};
				this._isMonster = false;				
			}
			var animal = new Animal();
			animal.init(this);
			this._sAnimal = animal;
			
			this.initLayer();

			return true;
		}
		return false;
	},
	initLayer:function(){
		this._node = cc.Node.create();
		this.addChild(this._node);

		var spriteImg;
		var statusImg;

		var cardType;
		if (!this.isMonster()){
			cardType = IMG.card.my;
		}else{
			cardType = IMG.card.monster;
		}
		
		// set card level
		if (this._info.Level >= 25){
			spriteImg = cardType.Purple;
			statusImg = cardType.Status.Purple;
		}else if (this._info.Level >= 15){
			spriteImg = cardType.Orange;
			statusImg = cardType.Status.Orange;			
		}else {
			spriteImg = cardType.Green;
			statusImg = cardType.Status.Green;
		}
		
		var sprite = cc.Sprite.create(spriteImg);
		var status = cc.Sprite.create(statusImg);

		// display effect attack img
		if (this._info.Skill[0] != undefined){
			var skillA = cc.Sprite.create(IMG.skill[this._info.Skill[0]]);
			skillA.setPosition(cc.p(237, 185));
			status.addChild(skillA);			
		}
		if (this._info.Skill[1] != undefined){
			var skillB = cc.Sprite.create(IMG.skill[this._info.Skill[1]]);
			skillB.setPosition(cc.p(237, 102));
			status.addChild(skillB);			
		}
		
		var pLevel = cc.Sprite.create(IMG.cardLv);
		var pHp = cc.Sprite.create(IMG.cardHp);

		// var t = cc.TextureCache.getInstance().addImage(IMG.skill["001"]);
		// skillB.setTexture(t);

		status.setPosition(cc.p(0, -70));
		pLevel.setPosition(cc.p(42, 78));
		pHp.setPosition(cc.p(70, 148));
		pHp.setScaleX(1);
		pHp.setAnchorPoint(cc.p(0, 0.5));
		this._nHp = pHp;

		this._node.addChild(sprite);
		this._node.addChild(status);
		sprite.addChild(pLevel);
		sprite.addChild(pHp);

		this._level = cc.LabelTTF.create("1", "", 50);
		this._level.setPosition(cc.p(-120, -210));
		this._node.addChild(this._level);

		this._name = cc.LabelTTF.create("cd", "", 50);
		this._name.setPosition(cc.p(0, 208));
		this._node.addChild(this._name);

		this._hp = cc.LabelTTF.create("1", "", 40);
		this._hp.setPosition(cc.p(-30, -93));
		this._node.addChild(this._hp);

		this._atk = cc.LabelTTF.create("1", "", 40);
		this._atk.setPosition(cc.p(-15, -153));
		this._node.addChild(this._atk);
	},
	getInfo:function(){
		return this._info;
	},
	hurt:function(damage, effect){
		var hurt = damage;
		if (this._damage + damage > this._info.HP){
			hurt = this._info.HP - this._damage;
			this._damage = this._info.HP;
		}else{
			this._damage = this._damage + damage;
		}
		
		if (this._damage == this._info.HP)
			this._sAnimal.die();

		this.updateInfo();
		this._sAnimal.hurt(hurt, effect);
	},
	updateInfo:function(){
		var info = this._info;
		this._level.setString(info.Level);
		this._name.setString(info.Name);
		this._hp.setString((info.HP - this._damage) + "/" + info.HP);
		this._atk.setString(info.Attack);
		this._nHp.setScaleX(1 - this._damage / info.HP);
	},
	getAnimal:function(){
		return this._sAnimal;
	},
	isMonster:function(){
		return this._isMonster;
	},
	updateDisplay:function(scrollViewOffset, wd){
		var distance = (this.getPosition().x + scrollViewOffset.x );
		var value = VisibleRect.center().x - distance;

		var temp = value / VisibleRect.center().x / 2.5;
		this.setScale(1 - Math.abs(temp));
		this.getCamera().setEye(10 * temp ,0, 10);

		var x = value / wd;

		var offset = cc.p(x * x* x* 30, 0);
		this._node.setPosition(offset);
	},
	attack:function(effect){
		this._sAnimal.attack(effect);
	}
});

Card.position = [
	cc.p(-198, -120),
	cc.p(-198, 120),
	cc.p(-370, -225),
	cc.p(-370, 0),
	cc.p(-370, 225)
];

Card.create = function(type, index){
	var card = new Card();
	card.init();
	if (type){
		card.setScale(0.44);
		var p = Card.position[index];
		var point = type == C.MONSTER ? cc.p(-p.x, p.y): p;
		card.setPosition(point);
	}
	return card;
};

Card.createWithInfo = function(info){
	var card = Card.createWithCombat(info);
	card._node.addChild(card.getAnimal().getNode());
	return card;
};

Card.createWithCombat = function(info){
	var card = new Card();
	card.init(info);
	card.updateInfo();
	card.setScale(0.44);
	var p = Card.position[info.Pos - 1];
	var point = info.Type == C.MONSTER ? cc.p(-p.x, p.y): p;
	card.setPosition(point);
	return card;
};
