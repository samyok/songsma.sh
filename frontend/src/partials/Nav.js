import logo from "./logo.png";
export default function Nav() {
    return (
        <>
            {" "}
            <div className="Nav">
                <img src={logo} alt="" />
                <h1>SongSmash</h1>
                <div className="filler" />
                <div className="link">
                    <a href="https://devpost.com/software/songsma-sh-tagline">Devpost</a>
                </div>
                <div className="link">
                    <a href="https://github.com/samyok/songsma.sh" target="_blank">
                        GitHub
                    </a>
                </div>
            </div>
            <div className="Footer">
                Made by Samyok Nepal, Allen Chang, Sampada Nepal, and Jason Chang
            </div>
        </>
    );
}
