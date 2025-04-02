import Button from "../components/Button"
import { Link } from 'react-router-dom';


function HomePage() {

  function test() {
    console.log("hee")
  }

  return (
    <div>
      <Link to="/lobby"><Button text="Start" func={test}/></Link>
    </div>
  )
}

export default HomePage
