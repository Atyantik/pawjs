declare module '@pawjs/srcset/picture' {
    type Props = {
        image: any
        imgClassName: string
        alt: string
        name?: string
    }
    class Picture extends React.Component<Props, any> {}
    export default Picture;
}

declare module '*?sizes=400w+800w&placeholder' {}
