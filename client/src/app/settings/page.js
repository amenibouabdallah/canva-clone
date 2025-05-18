"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import axios from "axios";

export default function SettingsPage() {
	const { data: session, status, update } = useSession();
	const [form, setForm] = useState({
		name: "",
		email: "",
		image: "",
	});
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		async function fetchUserProfile() {
			if (session?.user && session.idToken) {
				try {
					const res = await axios.get("http://localhost:5004/user/profile", {
						headers: { Authorization: `Bearer ${session.idToken}` },
					});
					if (res.data?.success && res.data.data) {
						setForm({
							name: res.data.data.name || "",
							email: res.data.data.email || "",
							image: res.data.data.image || "",
						});
					}
				} catch (err) {
					// Optionally handle error
				}
			}
		}
		fetchUserProfile();
	}, [session]);

	const handleChange = (e) => {
		setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			await axios.post(
				"http://localhost:5004/user/update-profile",
				form,
				{ headers: { Authorization: `Bearer ${session.idToken}` } }
			);
			if (update) update();
		} catch (err) {
			// handle error
		}
		setLoading(false);
	};

	return (
		<div className="max-w-xl mx-auto py-10">
			<Card>
				<CardHeader>
					<CardTitle>Account Settings</CardTitle>
					<CardDescription>
						Update your profile information
					</CardDescription>
				</CardHeader>
				<form onSubmit={handleSubmit} className="space-y-6 px-6 pb-6">
					<div className="flex items-center gap-4">
						<Avatar>
							<AvatarImage src={form.image} alt={form.name} />
							<AvatarFallback>{form.name?.[0]}</AvatarFallback>
						</Avatar>
						<Input
							name="image"
							value={form.image}
							onChange={handleChange}
							placeholder="Profile Image URL"
						/>
					</div>
					<div>
						<label className="block mb-1">Name</label>
						<Input
							name="name"
							value={form.name}
							onChange={handleChange}
						/>
					</div>
					<div>
						<label className="block mb-1">Email</label>
						<Input
							name="email"
							value={form.email}
							onChange={handleChange}
						/>
					</div>
					<div className="flex gap-2">
						<Button type="submit" disabled={loading}>
							{loading ? "Saving..." : "Save Changes"}
						</Button>
						<Button
							type="button"
							variant="outline"
							onClick={() => (window.location.href = "/")}
						>
							Go Back
						</Button>
					</div>
				</form>
			</Card>
		</div>
	);
}
