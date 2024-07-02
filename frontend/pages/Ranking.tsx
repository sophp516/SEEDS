import Navbar from "../components/Navbar";
import { StyleSheet, Text, View } from 'react-native';


const Ranking = () => {
    return (
      <View style={styles.container}>
        <Text>Ranking</Text>
        <Navbar />
      </View>

    );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
export default Ranking;