
export interface BalloonItem {
    color: number[];
    text: string;
}

export interface BalloonInfo {
    id: string;
    position: number[];
    title: string;
    titleColor: number[];
    items: BalloonItem [];
}

