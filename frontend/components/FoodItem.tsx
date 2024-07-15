import { NavigationProp, useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';

type RootStackParamList = {
    SelectedMenu: { foodName, reviewIds, image, location, price, taste, health, tags, allergens },
};

const FoodItem = ({ foodName, reviewIds, image, location, price, taste, health, tags, allergens }) => {

    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const navigateToReviews = () => {
        // const { foodName, image, location, price, taste, tags, allergens } = route.params;
        navigation.navigate('SelectedMenu', { foodName, reviewIds, image, location, price, taste, health, tags, allergens })
    }

    return (
        <TouchableOpacity onPress={navigateToReviews}>
            <View>
                <Image 
                source={image || require('../assets/image.png')}
                />
                <View>
                    <Text>$ {price}</Text>
                </View>
            </View>
            <View>
                <View>
                    <Text>{foodName}</Text>
                    <Text>({reviewIds.length} reviews)</Text>
                </View>
                <View>
                {tags.length > 0 && tags.map((tag, i) => {
                    return (
                        <View key={i}>
                            <Text>{tag}</Text>
                        </View>
                    )
                })}
                </View>
                <View>
                    <Text>Taste {taste}</Text>
                    <Text>Health {health}</Text>
                </View>
            </View>
        </TouchableOpacity>
    )
}

export default FoodItem;
