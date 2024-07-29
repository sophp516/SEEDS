import { StyleSheet, Text, View , Image} from 'react-native'
import React, {useEffect, useState} from 'react'
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firestore';
import colors from '../styles.js';

const UserRank = ({rank, displayName, profilePicture, likesCount}) => {
   
    return (
        <View style={rank < 3 ?  [styles.userRankContainer,{backgroundColor: '#F9A05F'} ]: [styles.userRankContainer, {backgroundColor: '#E7E2DB'}]}>
            <View style={styles.userInfoContainer}>
                <Text style={styles.rankNum}>{rank + 1}</Text>
                {profilePicture !== 'N/A' ? <Image style={styles.img} source={{uri: profilePicture}} /> : <Image style={styles.img} source={require('../assets/profile.jpeg')} />}
                <Text style={styles.nameText}>{displayName}</Text>
            </View>
            <View style={styles.likesContainer}>
                <Text style={styles.likesText}>{likesCount}</Text>
                <Image style={styles.heartImg} source={require('../assets/fullHeart.png')}/>
            </View>
        </View>
    )
}

export default UserRank

const styles = StyleSheet.create({
    userRankContainer:{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: 335,
        height: 42,
        marginBottom: 10,
        borderRadius: 15,
    },
    userInfoContainer:{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    img:{
        width: 30,
        height: 30,
        borderRadius: 50,
        marginRight: 10,
    },
    heartImg:{
        width: 20,
        height: 18,
    },
    rankNum: {
        color: colors.textGray,
        fontSize: 24,
        fontFamily: 'Satoshi-Bold',
        alignItems: 'center', 
        justifyContent: 'center',
        paddingRight: 15,
        paddingLeft: 15,
        textAlign: 'left',
        width: 55,
    },
    nameText:{
        color: colors.textGray,
        fontSize: 16,
        // lineHeight: 24,
        fontFamily: 'Satoshi-Medium' 
    },
    likesText:{
        color: colors.textGray,
        fontSize: 16,
        lineHeight: 24,
        fontFamily: 'Satoshi-Medium', 
        paddingRight: 4,
        marginRight: 4,

    },
    likesContainer:{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginRight: 15,
    }

})