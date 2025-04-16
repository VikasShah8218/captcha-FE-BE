import ESSILogo from "../../assets/images/essi-logo.png"
import "./footer.css"

const Footer = () => {
    return(
        <div className="footer">
            <div className="essi-footer">
                <div className="essi-logo">
                    <img src={ESSILogo} alt="" />
                </div>
                <div className="foooter-text">
                    <p>
                    ESSI , Fax: +91 - 11 - 41519898, Email:support@elkostaindia.com
                    www.essi.com , 101- Mercantile House, K.G Marg , New Delhi-110001 , Ph: +91 - 11 - 41519899
                    </p>
                </div>
            </div>
        </div>
    )
}
export default Footer;