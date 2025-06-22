import React, { useEffect, useState } from "react";
import {
    View,
    StyleSheet,
    TextInput,
    Text,
    TouchableOpacity,
    StatusBar,
    Alert,
    ImageBackground,
} from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import { useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { loginUser } from "../(services)/api/Users/loginUserAPI";
import { useDispatch, useSelector } from "react-redux";
import { loginAction } from "../(redux)/authSlice";
import { registerForPushNotificationsAsync } from "../../hooks/usePushNotifications";
import { doc, setDoc } from 'firebase/firestore';
import { db } from "../../firebase/firebaseConfig";

const LoginSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Required"),
    password: Yup.string().min(6, "Too Short!").required("Required"),
});

export default function Login() {
    const router = useRouter();
    const dispatch = useDispatch();
    const mutation = useMutation({
        mutationFn: loginUser,
        mutationKey: ["login"],
    });
    const [isLoading, setIsLoading] = useState(false);

    const user = useSelector((state) => state.auth.user);
    const userId = user?.user?._id || user?._id

    useEffect(() => {
        if (!user) return;

        const role = user?.user?.role || user.role;
        const stall = user?.user?.stall || user.stall || {};
        const address = user?.user?.address || user.address || { address: 0 };

        switch (role) {
            case "farmer":
                if (Object.keys(stall).length === 1 && "status" in stall && address.address === 0) {
                    router.replace("/components/User/addAddress");
                } else {
                    router.replace("/(tabs)");
                }
                break;
            case "composter":
                if (Object.keys(stall).length === 1 && "status" in stall && address.address === 0) {
                    router.replace("/components/User/addAddress");
                } else {
                    router.replace("/components/Composter/(tabs)");
                }
                break;
            case "vendor":
                if (Object.keys(stall).length === 1 && "status" in stall) {
                    router.replace("/components/User/addAddress");
                } else {
                    router.replace("/components/Vendor/(tabs)");
                }
                break;
            case "admin":
                router.replace("/components/Admin/(tabs)");
                break;
        }
    }, [user, router]);

    return (
        <>
            <StatusBar translucent backgroundColor="transparent" />
            <ImageBackground
                source={require("../../assets/bg-leaf.png")}
                style={styles.background}
                resizeMode="cover"
            >
                <View style={styles.container}>
                    <Text style={styles.welcomeText}>No Waste</Text>
                    <Text style={styles.subText}>Login to your account</Text>

                    <View style={styles.card}>
                        <Formik
                            initialValues={{ email: "", password: "" }}
                            validationSchema={LoginSchema}
                            onSubmit={(values) => {
                                setIsLoading(true);
                                mutation.mutateAsync(values)
                                    .then(async (data) => {
                                        if (data?.user?.isDeleted) {
                                            setIsLoading(false);
                                            Alert.alert(
                                                "Account Deleted",
                                                "Your account has been deleted. Please contact support.",
                                                [{ text: "OK" }]
                                            );
                                            return;
                                        }

                                        dispatch(loginAction(data));

                                        const token = await registerForPushNotificationsAsync(data.user._id);

                                        if (token && data?.user?._id) {
                                            await setDoc(doc(db, 'users', data.user._id), {
                                                expoPushToken: token
                                            }, { merge: true });
                                        }

                                    })
                                    .catch((error) => {
                                        setIsLoading(false);
                                        const errorMessage =
                                            error?.response?.data?.message || "An unexpected error occurred.";

                                        if (errorMessage === "Account has been deleted") {
                                            Alert.alert(
                                                "Account Deleted",
                                                "Contact Support: #09755663543, Lira Baltazar",
                                                [{ text: "OK" }]
                                            );
                                        } else {
                                            Alert.alert(
                                                "Login Failed",
                                                errorMessage,
                                                [{ text: "OK" }]
                                            );
                                        }
                                    });
                            }}
                        >
                            {({
                                handleChange,
                                handleBlur,
                                handleSubmit,
                                values,
                                errors,
                                touched,
                            }) => (
                                <View style={styles.form}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Email"
                                        onChangeText={handleChange("email")}
                                        onBlur={handleBlur("email")}
                                        value={values.email}
                                        keyboardType="email-address"
                                    />
                                    {errors.email && touched.email && (
                                        <Text style={styles.errorText}>{errors.email}</Text>
                                    )}

                                    <View style={styles.passwordContainer}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Password"
                                            onChangeText={handleChange("password")}
                                            onBlur={handleBlur("password")}
                                            value={values.password}
                                            secureTextEntry
                                        />
                                    </View>
                                    {errors.password && touched.password && (
                                        <Text style={styles.errorText}>{errors.password}</Text>
                                    )}

                                    <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                                        <Text style={styles.buttonText}>Sign in</Text>
                                    </TouchableOpacity>

                                    <View style={styles.registerContainer}>
                                        <Text style={styles.registerText}>Create account? </Text>
                                        <TouchableOpacity onPress={() => router.push("/auth/register")}>
                                            <Text style={styles.signUpText}>Sign up</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </Formik>
                    </View>
                </View>
            </ImageBackground>
        </>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        width: "100%",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#d4ffb2",
    },
    subText: {
        fontSize: 16,
        color: "#85ff7a",
        marginBottom: 20,
    },
    card: {
        backgroundColor: "#fff",
        width: "100%",
        padding: 20,
        borderRadius: 20,
        elevation: 5,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
    },
    form: {
        width: "100%",
    },
    input: {
        width: "100%",
        height: 50,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
        marginBottom: 10,
        fontSize: 16,
        paddingHorizontal: 10,
    },
    errorText: {
        color: "red",
        fontSize: 12,
        marginBottom: 5,
    },
    passwordContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    forgotText: {
        color: "#009688",
        fontSize: 14,
    },
    button: {
        backgroundColor: "#008060",
        paddingVertical: 15,
        borderRadius: 25,
        marginTop: 20,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    registerContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 15,
    },
    registerText: {
        fontSize: 14,
        color: "#666",
    },
    signUpText: {
        fontSize: 14,
        color: "#008060",
        fontWeight: "bold",
    },
});