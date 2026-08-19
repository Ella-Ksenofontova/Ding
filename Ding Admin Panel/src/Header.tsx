import './Header.css'
import {House} from 'react-bootstrap-icons'

function Header() {
    return (
        <header className="header">
            <a href="/"><span className="visually-hidden">На главную</span><House color='#fff' size={50}/></a>
            <h1 className='heading heading-level-1 header-title'>Панель управления Ding</h1>
        </header>
    )
}

export default Header