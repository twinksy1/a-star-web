class Node {
    constructor(x, y, w, h, isNull) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.isNull = isNull;
        this.clicked = false;
        this.color = defColor;
        this.gcost = 0;
        this.fcost = 0;
        this.hcost = 0;
        this.parent = [];
        if(this.isNull) {
            this.color = nullColor;
        }
    }
    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }
}