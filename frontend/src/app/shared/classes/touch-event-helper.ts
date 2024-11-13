import { Component, EventEmitter, HostListener, signal } from "@angular/core";
import { Vector2 } from "three";
import { USER_EVENTS } from "../enums/user-events";

@Component({
    template: ''
})
export class TouchEventHelper {

    touchStartEvent: EventEmitter<Vector2> = new EventEmitter<Vector2>();
    touchDragEvent: EventEmitter<Vector2> = new EventEmitter<Vector2>();
    touchEndEvent: EventEmitter<Vector2> = new EventEmitter<Vector2>();
    touchClickEvent: EventEmitter<Vector2> = new EventEmitter<Vector2>();
    startPos: Vector2 = new Vector2();
    endPos: Vector2 = new Vector2();
    dragPos: Vector2 = new Vector2();

    private dragStarted = signal<boolean>(false);

    constructor() { }

    //touch events
    @HostListener(USER_EVENTS.touchStart, ['$event'])
    onTouchStart(event: TouchEvent) {
        if (event.touches.length > 0) {
            this.startPos = new Vector2(event.touches[0].clientX, event.touches[0].clientY);
            this.touchStartEvent.emit(this.startPos);
            this.dragStarted.set(true);
        }
    }
    @HostListener(USER_EVENTS.touchEnd, ['$event'])
    onTouchEnd(event: TouchEvent) {
        if (event.changedTouches.length > 0) {
            this.endPos = new Vector2(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
            this.touchEndEvent.emit(this.endPos);
            this.dragStarted.set(false);
        }
    }

    @HostListener(USER_EVENTS.mouseMove, ['$event'])
    @HostListener(USER_EVENTS.touchMove, ['$event'])
    onMouseMove(event: MouseEvent | TouchEvent) {
        if (this.dragStarted()) {
            this.dragPos = this.getPosition(event);
            this.touchDragEvent.emit(this.dragPos);
        }
    }

    //mouse events
    @HostListener(USER_EVENTS.mouseDown, ['$event'])
    onMouseDown(event: MouseEvent) {
        this.startPos = new Vector2(event.clientX,event.clientY);
        this.touchStartEvent.emit(this.startPos);
        this.dragStarted.set(true);
    }
    @HostListener(USER_EVENTS.mouseUp, ['$event'])
    onMouseUp(event: MouseEvent) {
        this.endPos =new Vector2(event.clientX,event.clientY);
        this.touchEndEvent.emit(this.endPos);
        this.touchClickEvent.emit(this.endPos);
        this.dragStarted.set(false);
    }

    private getPosition(event: MouseEvent | TouchEvent): Vector2 {
        let clientX = 0;
        let clientY = 0;

        if (event instanceof MouseEvent) {
            clientX = event.clientX;
            clientY = event.clientY;
        } else if (event instanceof TouchEvent && event.touches.length > 0) {
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
        }

        return new Vector2(clientX,clientY);
    }
}