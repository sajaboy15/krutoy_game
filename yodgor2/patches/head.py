r"""Hero head patch for the Kyok Bori engine (kyok/index.html).

Gives the hero a human head (Central Asian look: tan skin, black-and-white
chust doppi, black hair, short dark beard) everywhere he is drawn, and removes
the blue head-flame, its glow and its wisps.

REPLACEMENTS = [(old, new, count), ...]  -- exact substrings of kyok/index.html
(each must occur exactly `count` times; apply in order with str.replace).

Run directly to write a patched copy next to this file:
    python3 -I patch_head.py [out.html]
"""
import pathlib
import sys

# ---------------------------------------------------------------------------
# Runtime helper inserted into the Player module right after
# `t.PLAYER_PAL=i;`  (scope there: t=window.G, e=G.U, a=G.Art, i=PLAYER_PAL).
# Everything else calls it as window.G.HERO_HEAD at draw time.
# ---------------------------------------------------------------------------
HERO_HEAD_JS = r"""
Object.assign(i,{skinD:"#a8825f",hair:"#2e2220",cap:"#231e2c",capW:"#eee6d2"});
t.HERO_HEAD={v:1,
rows:[".KKKWK.","KKKWKKK","KKKKKKK","HHDsss.","HHDsEs.","HHDssss",".HBDBB.","..BBBB.","...BB.."],
ax:3,ay:8,tuck:[2,6],
face:[".KKKKKKKKKK.","KKKKKKWKKKKK","KWKKKWWKKKWK","KWKKKWWKKKWK","KKKKKWKKKKKK","KKKKKKKKKKKK","HssssssssssH","HsHHHssHHHsH","HssssssssssH","DswEEssEEwsD","DssEEsDEEssD","DssssDsssssD",".HsssDDsssH.",".HsHHHHHHsH.",".HHHsDDsHHH.",".HHHHHHHHHH.",".HHHHHHHHHH.","..HHHHHHHH..","...HHHHHH...","....HHHH...."],
pal(){return{K:i.cap,W:i.capW,H:i.hair,B:i.hair,E:i.hair,s:i.skin,D:i.skinD,F:i.skinF,w:"#efe8dc"}},
spr(k){const r=this.rows;return a.sprite("heroHead"+k+"_"+this.v,k?r.map(q=>q.replace(/E/g,"D")):r,this.pal())},
draw(o,x,y,p,s){s=s||{};const k=s.dead||p&&("hurt"===p.state||p.t%220<7)?1:0;s.roll>0&&(x+=this.tuck[0],y+=this.tuck[1]);o.drawImage(this.spr(k),Math.round(x)-this.ax,Math.round(y)-this.ay)},
faceSpr(b){const e0=this.face.findIndex(q=>q.includes("E")),r=b?this.face.map((q,j)=>j===e0?q.replace(/[Ew]/g,"s"):j===e0+1?q.replace(/E/g,"H"):q):this.face;return a.sprite("heroFace"+(b?1:0)+"_"+this.v,r,this.pal())},
portrait(c,b){
c.fillStyle=i.robe,c.beginPath(),c.moveTo(-32,34),c.quadraticCurveTo(-24,8,0,8),c.quadraticCurveTo(24,8,32,34),c.fill();
c.fillStyle=i.robeD,c.beginPath(),c.moveTo(-6,10),c.lineTo(6,10),c.lineTo(9,34),c.lineTo(-9,34),c.closePath(),c.fill();
c.strokeStyle=i.trim,c.lineWidth=2.4,c.beginPath(),c.moveTo(-6,10),c.lineTo(-10,34),c.moveTo(6,10),c.lineTo(10,34),c.stroke();
c.fillStyle=i.skinD,c.fillRect(-4,1,8,10);
c.fillStyle=i.fur,c.beginPath(),c.ellipse(0,9.5,12,4.4,0,0,6.283),c.fill();
c.save(),c.setTransform(1,0,0,1,0,0),c.drawImage(this.faceSpr(b),10,3),c.restore()},
fallen(){if(this._fb&&this._fb.v===this.v)return this._fb;const W=48,H=20,f={state:"hurt",scarf:[],facing:1,x:0,y:0,vx:0,t:0,act:null},s={hip:[0,-12],sh:[0,-21],nf:[2,0],ff:[-1,0],nh:[3,-11],fh:[-2,-11],ext:1,extB:1,item:null,wAng:0,lean:0,legs:null,roll:-1},cv=a.bake(W,H,c=>{c.translate(40,10),c.rotate(-Math.PI/2),t.Player.prototype.drawPuppet.call(f,c,s)},{outline:i.out,rim:{color:"#fff3d6",dx:-1,dy:-1,a:.35}}),d=cv.ctx.getImageData(0,0,W,H).data;let x0=W,x1=-1,y0=H,y1=-1;for(let y=0;y<H;y++)for(let x=0;x<W;x++)d[4*(y*W+x)+3]&&(x<x0&&(x0=x),x>x1&&(x1=x),y<y0&&(y0=y),y>y1&&(y1=y));return cv.v=this.v,cv.bb=[x0,y0,x1-x0+1,y1-y0+1],this._fb=cv},
deathIcon(c,x,y){const cv=this.fallen(),b=cv.bb,k=2,w=b[2]*k;c.drawImage(cv,b[0],b[1],b[2],b[3],Math.round(x-w/2),Math.round(y-b[3]*k+2),w,b[3]*k),c.fillStyle="#3a3446",c.fillRect(Math.round(x-w/2-6),y,w+12,1)}
};
"""


def _js(src):
    """Join the readable JS above into one line (no // comments are used)."""
    return ''.join(line.strip() for line in src.strip().splitlines())


REPLACEMENTS = [
    # 1. Head helper + palette keys (Player module, after PLAYER_PAL).
    ('t.PLAYER_PAL=i;',
     't.PLAYER_PAL=i;' + _js(HERO_HEAD_JS), 1),
    # 2. Gameplay puppet: draw the head right after the torso (before weapon / near arm).
    ('o.drawImage(S,0,e,S.width,1,T+a,A+e,S.width,1)}const F=s.item;',
     'o.drawImage(S,0,e,S.width,1,T+a,A+e,S.width,1)}t.HERO_HEAD.draw(o,n[0],n[1]-2,this,s);const F=s.item;', 1),
    # 3. Drop the grey neck stump that was drawn last (over the arm).
    ('o.fillStyle="#7a7268",o.fillRect(Math.round(n[0]-1),Math.round(n[1]-2),3,2),this.neck=',
     'this.neck=', 1),
    # 4. Dead pose: head on the fallen body (eyes closed).
    ('t.drawImage(a.sprite("torso",f,c),-4,-26)}',
     't.drawImage(a.sprite("torso",f,c),-4,-26),window.G.HERO_HEAD.draw(t,0,-27,this,{dead:1})}', 1),
    # 5. drawFx: remove head flame, eye dots, head glow, wisps and the roll glow.
    ('let s,n;if("roll"!==this.state&&this.neck)if("dead"===this.state){const t=Math.min(1,this.stateT/24);s=this.x-22*this.facing*t,n=this.y-24+22*t}else s=this.x+this.neck.x*this.facing,n=this.y+this.neck.y+1;else s=this.x,n=this.y-12;const i="dead"===this.state?Math.max(0,1-this.stateT/40):1;if(i>0&&"roll"!==this.state){const r="heal"===this.state&&this.stateT>12?1:0;a.drawFlame(o,s,n,t.time,{w:9+2*r,h:Math.round((13+4*r)*i),pal:a.FLAME_SPIRIT,seed:9,glow:"#6fe3d1",glowR:22,glowA:.6,fps:16}),o.fillStyle="#ffffff",o.fillRect(Math.round(s+1*this.facing),Math.round(n-6),1,1),o.fillRect(Math.round(s+3*this.facing),Math.round(n-6),1,1),t.Glow.add(s,n-6,26,"#6fe3d1",.55),this.t%4==0&&t.FX.spawn({x:s+e.rand(-2,2),y:n-10,vx:e.rand(-.2,.2)-.15*this.vx,vy:-e.rand(.4,1),life:e.randi(14,26),size:1,color:e.choose(["#6fe3d1","#c9fff5"]),glow:!0,glowR:0})}else"roll"===this.state&&t.Glow.add(this.x,this.y-9,18,"#6fe3d1",.4);',
     '', 1),
    # 6. Dialog / intro portrait 'hero' (default branch of Pt): a face instead of a neck stump.
    (':(a.fillStyle="#2b3a6b",a.beginPath(),a.moveTo(-30,34),a.quadraticCurveTo(-22,8,0,8),a.quadraticCurveTo(22,8,30,34),a.fill(),a.fillStyle="#e8b850",a.fillRect(-3,10,6,24),a.fillStyle="#c9b18a",a.beginPath(),a.ellipse(0,9,12,5,0,0,6.283),a.fill(),a.fillStyle="#5f584f",a.fillRect(-4,0,8,7))}),{outline:null})',
     ':window.G.HERO_HEAD.portrait(a,e)}),{outline:null})', 1),
    # 7. Portrait: let the hero blink like the others; no flame drawn over the portrait.
    ('(e,n%200<7&&"stone"!==e&&"hero"!==e),o+2,s+2),"hero"===e&&I&&a.drawFlame(t,o+18,s+18,n/60,{pal:a.FLAME_SPIRIT,w:9,h:13,glow:"#6fe3d1",glowR:12,glowA:.35})}',
     '(e,n%200<7&&"stone"!==e),o+2,s+2)}', 1),
    # 8. Title / intro / victory backdrop hero: taller bake so the head fits ...
    ('Lt.hero=a.bake(34,36,(t=>{t.translate(12,33);',
     'Lt.hero=a.bake(34,44,(t=>{t.translate(12,41);', 1),
    # 9. ... head instead of the neck stump ...
    ('t.fillStyle="#5f584f",t.fillRect(-1.5,-27.5,3.5,3),',
     'window.G.HERO_HEAD.draw(t,0,-27,null,{}),', 1),
    # 10. ... drawn 8px higher, no flame on top.
    ('o.drawImage(Lt.hero,Gt-12,Ht-33),a.drawFlame(o,t+1,e-1,h,{pal:a.FLAME_SPIRIT,w:9,h:14,glow:"#6fe3d1",glowR:18,glowA:.4})}',
     'o.drawImage(Lt.hero,Gt-12,Ht-41)}', 1),
    # 12 (listed before 11 is fine; independent). Heal: raise the flask to the mouth, not to the old flame.
    ('a.nh=[e.lerp(4,2,t),e.lerp(-13,-26,t)],a.flask=!0',
     'a.nh=[e.lerp(4,5,t),e.lerp(-13,-24,t)],a.flask=!0', 1),
    # 11. Death screen: the fallen hero instead of the dying spirit flame.
    ('I&&(e.globalAlpha=i*h,a.drawFlame(e,s/2,64,X/60,{pal:a.FLAME_SPIRIT,w:u(13*f)+3,h:u(22*f)+4,glowR:u(24*f),glowA:.3}),e.globalAlpha=i,ut(e,s/2-7,64,14,1,"#3a3446"));',
     'I&&(e.globalAlpha=i,window.G.HERO_HEAD.deathIcon(e,s/2,64));', 1),
]


def apply(src, reps=REPLACEMENTS):
    out = src
    for old, new, n in reps:
        got = out.count(old)
        assert got == n, ('replacement target count mismatch', old[:100], got, n)
        out = out.replace(old, new)
    return out


if __name__ == '__main__':
    here = pathlib.Path(__file__).resolve().parent
    src = (here.parent.parent / 'kyok' / 'index.html').read_text(encoding='utf-8')
    dst = here / (sys.argv[1] if len(sys.argv) > 1 else 'index_head.html')
    dst.write_text(apply(src), encoding='utf-8')
    print('wrote', dst, len(REPLACEMENTS), 'replacements')
