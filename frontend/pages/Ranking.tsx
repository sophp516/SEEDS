import Navbar from "../components/Navbar";
import { StyleSheet, Text, View } from 'react-native';
import colors from "../styles.js";


const Ranking = () => {
    return (
      <View style={styles.container}>
        <Text style={styles.leaderboardText}>Leaderboard</Text>
        <Navbar />
      </View>

    );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundGray,
      alignItems: 'center',
      flexDirection: 'column',
      width: '100%',
    },
    leaderboardText: {
      marginTop: 60,
      fontSize: 20,
    }
  });
export default Ranking;